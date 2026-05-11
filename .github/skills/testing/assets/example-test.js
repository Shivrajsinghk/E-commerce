// Example Playwright end-to-end test for user registration and login flow
const { test, expect } = require('@playwright/test');

test.describe('E-commerce User Flows', () => {
  test('User can register and login', async ({ page }) => {
    // Navigate to signup page
    await page.goto('http://localhost:5173/signup'); // Adjust port as needed

    // Fill registration form
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.fill('input[name="confirmPassword"]', 'testpass123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to login or home
    await expect(page).toHaveURL(/\/login|\/$/);

    // Now login
    if (page.url().includes('/login')) {
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="password"]', 'testpass123');
      await page.click('button[type="submit"]');
    }

    // Should be logged in (check for logout button or user menu)
    await expect(page.locator('text=Logout')).toBeVisible();
  });

  test('User can browse products and add to cart', async ({ page }) => {
    // Assume user is logged in from previous test or login here
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');

    // Navigate to products
    await page.goto('http://localhost:5173/');

    // Click on first product
    await page.locator('.product-card').first().click();

    // Add to cart
    await page.click('button:text("Add to Cart")');

    // Check cart has item
    await page.click('text=Cart');
    await expect(page.locator('.cart-item')).toHaveCount(1);
  });

  test('User can complete checkout', async ({ page }) => {
    // Login and add item to cart (reuse from above)
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');

    await page.goto('http://localhost:5173/');
    await page.locator('.product-card').first().click();
    await page.click('button:text("Add to Cart")');

    // Go to checkout
    await page.click('text=Cart');
    await page.click('button:text("Checkout")');

    // Fill checkout form (assuming address fields)
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="address"]', '123 Test St');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="pincode"]', '12345');

    // Submit order
    await page.click('button:text("Place Order")');

    // Should show success message
    await expect(page.locator('text=Order placed successfully')).toBeVisible();
  });
});