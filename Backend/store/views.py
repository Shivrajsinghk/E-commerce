from rest_framework.decorators import api_view
from .models import *
from .serializers import *
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
import razorpay
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q

@api_view(['GET'])
def get_products(request):
    products = Product.objects.select_related("category").all().order_by("-created_at")

    search = request.query_params.get("search", "").strip()
    category = request.query_params.get("category", "").strip()
    min_price = request.query_params.get("min_price", "").strip()
    max_price = request.query_params.get("max_price", "").strip()
    sort = request.query_params.get("sort", "").strip()

    if search:
        products = products.filter(
            Q(name__icontains=search)
            | Q(description__icontains=search)
            | Q(category__name__icontains=search)
        )

    if category:
        if category.isdigit():
            products = products.filter(category_id=int(category))
        else:
            products = products.filter(category__slug=category)

    if min_price:
        try:
            products = products.filter(price__gte=min_price)
        except (TypeError, ValueError):
            pass

    if max_price:
        try:
            products = products.filter(price__lte=max_price)
        except (TypeError, ValueError):
            pass

    sort_options = {
        "price_asc": "price",
        "price_desc": "-price",
        "name_asc": "name",
        "name_desc": "-name",
        "oldest": "created_at",
        "newest": "-created_at",
    }
    products = products.order_by(sort_options.get(sort, "-created_at"))

    paginator = PageNumberPagination()
    paginator.page_size = 32
    result_page = paginator.paginate_queryset(products, request)
    serializer = ProductSerializer(result_page, many=True) 
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
def get_product(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    serializer = ProductSerializer(product, context = {'request': request})
    return Response(serializer.data)

@api_view(['POST'])
def create_product(request):
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_categories(request):
    serializer = CategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_cart(request):
    user = request.user
    cart, created = Cart.objects.get_or_create(user=user)
    serializer = CartSerializer(cart, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def add_to_cart(request):
    user = request.user
    cart, created = Cart.objects.get_or_create(user=user)
    product_id = request.data.get("product_id")
    quantity = int(request.data.get("quantity", 1))
    if quantity < 1:
        return Response({"error": "Quantity must be at least 1"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    cart_item, created = CartItem.objects.get_or_create(
        cart = cart,
        product = product,
        defaults= {
            "quantity": quantity
        }
    )
    # If already exists, update the quantity
    if not created:
        cart_item.quantity += quantity
        cart_item.save()
    serializer = CartItemSerializer(cart_item, context={'request':request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def remove_from_cart(request):
    user = request.user
    cart, created = Cart.objects.get_or_create(user=user)
    product_id = request.data.get('product_id')
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    try:
        cart_item = CartItem.objects.get(cart=cart, product=product)
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except CartItem.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def update_cart(request):
    user = request.user
    cart, created = Cart.objects.get_or_create(user=user)
    product_id = request.data.get('product_id')
    quantity = int(request.data.get('quantity'))
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    try:
        cart_item = CartItem.objects.get(cart=cart, product=product)
        cart_item.quantity = quantity
        cart_item.save()
        serializer = CartItemSerializer(cart_item, context={'request': request})
        return Response(serializer.data)
    except CartItem.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)   
    
def _create_cod_order(request):
    # Fetch user details and cart information from the frontend 
    data = request.data
    name = data.get("name")
    email = data.get("email")
    address = data.get("address")   
    phone_number = data.get("phone_number")
    payment_method = data.get("payment_method", "COD")

    # Validate fields
    if not all([name, email, address, phone_number]):
        return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)
    if payment_method != "COD":
        return Response({"error": "This endpoint only supports COD orders"}, status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user 

    # Get user's cart
    cart, created = Cart.objects.get_or_create(user=user)
    if not cart:
        return Response({"error": "No cart found"}, status=400)
    if not cart.items.exists():
        return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)
    # Create order
    order = Order.objects.create(
        user=user,
        total_price=cart.total,
        name=name,
        email=email,
        address=address,
        phone_number=phone_number,
        payment_method="COD",
        payment_status="pending",
        order_status="placed"
    )
    # Create order items
    for item in cart.items.all():
        OrderItem.objects.create(
            order=order,
            product=item.product,
            quantity=item.quantity,
            price=item.product.price
        )
    # Clear cart
    cart.items.all().delete()  

    return Response({"message": "Order created successfully", "order_id": order.id}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_cod_order(request):
    return _create_cod_order(request)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_order(request):
    payment_method = request.data.get("payment_method")
    if payment_method == "COD":
        return _create_cod_order(request)
    elif payment_method == "RAZORPAY":
        return create_razorpay_order(request)
    else:
        return Response({"error": "Invalid payment method"}, status=400)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({"message": "User registered successfully", "User": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def user_profile(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    # Fetch Profile
    if request.method == "GET":
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    # Update Profile  
    elif request.method == 'PUT':
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
@permission_classes([AllowAny])
def user_order_history(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_razorpay_order(request):
    try:
        client = razorpay.Client(auth=(
            settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET
        ))
        user = request.user
        cart, created = Cart.objects.get_or_create(user=user)
        if not cart.items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)
        data = request.data
        order = Order.objects.create(
            user=user,
            total_price = cart.total,
            name = data.get("name"),
            email = data.get("email"),
            address = data.get("address"),
            phone_number = data.get("phone_number"),
            payment_method = 'RAZORPAY',
            payment_status = 'pending',
            order_status = 'placed',
        )
        amount_paise = int(float(cart.total) * 100)
        razorpay_order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": f"order_{order.id}",
            "notes": {"local_order_id": str(order.id)}
        })
        order.razorpay_order_id = razorpay_order.get("id")
        order.save()
        return Response({
            "success": True,
            "order_id": order.id,
            "razorpay_order_id": razorpay_order.get("id"),
            "amount": razorpay_order.get("amount"),
            "currency": razorpay_order.get("currency"),
            "key": settings.RAZORPAY_KEY_ID,
        })
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_razorpay_payment(request):
    try:
        data = request.data
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        client.utility.verify_payment_signature({
            "razorpay_order_id": data.get("razorpay_order_id"),
            "razorpay_payment_id": data.get("razorpay_payment_id"),
            "razorpay_signature": data.get("razorpay_signature"),
        })
        # Find the Order
        order = Order.objects.get(
            id=data.get("order_id"),
            user=request.user,
            razorpay_order_id=data.get("razorpay_order_id")
        )
        # Update the Order (Filling the missing Order Model fields)
        order.razorpay_payment_id = data.get("razorpay_payment_id")
        order.razorpay_signature = data.get("razorpay_signature")
        order.payment_status = "paid"
        order.order_status = "confirmed"
        order.save()
        cart = Cart.objects.get(user=request.user)
        for item in cart.items.all():
            OrderItem.objects.get_or_create(
                order=order,
                product=item.product,
                defaults={"quantity": item.quantity, "price": item.product.price},
            )
        cart.items.all().delete()
        return Response({
            "success": True,
            "message": "Payment verified successfully"
        })
    except razorpay.errors.SignatureVerificationError:
        return Response({
            "success": False,
            "error": "Invalid signature"
        })
    except Order.DoesNotExist:
        return Response({
            "success": False,
            "error": "Order not found"
        })
    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        })
    
