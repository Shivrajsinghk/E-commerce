from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("register/", register, name="register"),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("get_products/", get_products, name="get_products"),
    path("get_product/<int:pk>/", get_product, name="get_product"),
    path("create_product/", create_product, name="create_product"),
    path("get_categories/", get_categories, name="get_categories"),
    path("create_categories/", create_categories, name="create_categories"),
    path("get_cart/", get_cart, name="get_cart"),
    path("add_to_cart/", add_to_cart, name="add_to_cart"),
    path("remove_from_cart/", remove_from_cart, name="remove_from_cart"),
    path("update_cart/", update_cart, name="update_cart"),
    path("create_order/", create_order, name="create_order"),
    path("create_cod_order/", create_cod_order, name="create_cod_order"),
    path("create_razorpay_order/", create_razorpay_order, name="create_razorpay_order"),
    path("verify_razorpay_payment/", verify_razorpay_payment, name="verify_razorpay_payment"),
    path("user_profile/", user_profile, name="user_profile"),   
    path("user_order_history/", user_order_history, name="user_order_history"),
]
