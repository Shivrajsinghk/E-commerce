from .models import *
from faker import Faker
fake = Faker()

def seed(n=10):
    for _ in range(n):
        category = Category.objects.create(
            name=fake.word(),
            slug=fake.slug()
        )
    
        product = Product.objects.create(
            category=category,
            name=fake.word(),
            description=fake.text(),
            price=fake.random_number(digits=5),
        )
        
        user = User.objects.create_user(
            username=fake.user_name(),
            email=fake.email(),
            password='password'
        )
        
        user_profile = UserProfile.objects.create(
            user=user,
            address=fake.address(),
            phone_number=fake.phone_number()
        )
        
        order = Order.objects.create(
            user=user,
            total_price=product.price
        )
        
        order_item = OrderItem.objects.create(
            order=order,
            product=product,
            quantity=fake.random_number(digits=1),
            price=product.price
        )
        