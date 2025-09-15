from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        page.goto("http://localhost:3000")
        upload_link = page.get_by_role("link", name="Upload CSV")
        upload_link.click()

        print("Dialog opened.")

        page.set_input_files('input[type="file"]', 'jules-scratch/verification/dummy.csv')
        print("File input set.")

        # Give the app time to process
        page.wait_for_timeout(2000)

        toast_locator = page.locator("ol > li", has_text="Failed to process CSV file. Please try again.")

        try:
            expect(toast_locator).to_be_visible(timeout=5000)
            print("Toast found!")
        except Exception as e:
            print("Toast not found. Taking a screenshot of the page.")
            page.screenshot(path="jules-scratch/verification/no-toast-error.png")
            raise e

        page.screenshot(path="jules-scratch/verification/error-toast.png")
        print("Screenshot saved to jules-scratch/verification/error-toast.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
