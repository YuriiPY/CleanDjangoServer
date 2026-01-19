import time
import os
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
from .models import ScrapedArticle

def run_scraper(query="chopin", start_date_str="01.10.2025", end_date_str="31.10.2025"):
    print(f"Starting scraper for query='{query}' from {start_date_str} to {end_date_str}...")
    

    chrome_options = webdriver.ChromeOptions()

    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")


    selenium_host = os.environ.get('SELENIUM_HOST', 'http://selenium:4444/wd/hub')
    
    try:
        driver = webdriver.Remote(
            command_executor=selenium_host,
            options=chrome_options
        )
    except Exception as e:
        print(f"Failed to connect to Selenium Grid: {e}")
        return {"status": "error", "message": f"Failed to connect to Selenium Grid: {e}"}

    try:
        driver.get("https://tvpworld.com/")
        driver.set_window_size(1200, 800)
        driver.set_page_load_timeout(30)


        try:
            driver.find_element(By.CSS_SELECTOR, "div.tvp-covl__ab").click()
        except:
            pass


        time.sleep(1)
        
        try:
            driver.find_element(By.CSS_SELECTOR, "button.header__search").click()
        except NoSuchElementException:
            pass

        time.sleep(1)
        search_input = driver.find_element(By.CSS_SELECTOR, "input.search-form__input")
        search_input.clear()
        search_input.send_keys(query)
        driver.find_element(By.CSS_SELECTOR, "button.search-form__search").click()
        
        time.sleep(2)
        
        try:
            pages_number_element = driver.find_element(By.CSS_SELECTOR, "a.pagination__item.pagination__item--last")
            pages_number = int(pages_number_element.text.strip())
        except:
            pages_number = 2


        
        try:
            first_date = datetime.strptime(start_date_str, "%d.%m.%Y")
            last_date = datetime.strptime(end_date_str, "%d.%m.%Y")
        except ValueError:

             first_date = datetime.strptime("01.01.2020", "%d.%m.%Y")
             last_date = datetime.now()
        
        table = []
        

        

        articles_to_scrape = []

        def extract_from_page():
            all_data = driver.find_elements(By.CSS_SELECTOR, "div.search__content")
            for i in all_data:
                try:
                    data_value = i.find_element(By.CSS_SELECTOR, "div.search__info p.search__date").text.strip()
                    date = datetime.strptime(data_value, "%d %B %Y")
                    

                    if first_date <= date <= last_date:
                        link_el = i.find_element(By.CSS_SELECTOR, "a.search__wrapp")
                        title_el = i.find_element(By.CSS_SELECTOR, "h4.search__title")
                        articles_to_scrape.append({
                            "date": date,
                            "title": title_el.text.strip(),
                            "link": link_el.get_attribute("href")
                        })
                except Exception as e:
                    continue

        extract_from_page()


        for page_number in range(2, pages_number + 1):
             try:
                driver.get(f"https://tvpworld.com/search?query={query}&page={page_number}")
                time.sleep(1)
                extract_from_page()
             except Exception:
                 continue


        saved_count = 0
        from django.core.files.base import ContentFile
        import base64

        for item in articles_to_scrape:

            if ScrapedArticle.objects.filter(link=item['link']).exists():
                continue

            try:
                driver.get(item['link'])
                time.sleep(1)
                
                content = ""
                try:
                    content = driver.find_element(By.CSS_SELECTOR, "span.article__paragraph-text").text
                except NoSuchElementException:
                    try:
                        content = driver.find_element(By.CSS_SELECTOR, "p.article__lead").text
                    except NoSuchElementException:
                         pass
                

                try:
                    pdf_data = driver.execute_cdp_cmd("Page.printToPDF", {
                        "printBackground": True,
                        "paperWidth": 8.27,
                        "paperHeight": 11.69,
                    })
                    pdf_content = base64.b64decode(pdf_data['data'])
                    
                    filename = f"article_{int(time.time())}.pdf"
                    
                    # Create object
                    article = ScrapedArticle(
                        title=item['title'],
                        link=item['link'],
                        date_published=item['date'],
                        content=content
                    )
                    article.pdf_file.save(filename, ContentFile(pdf_content), save=True)
                    saved_count += 1
                    
                except Exception as e:
                    print(f"Failed to generate/save PDF for {item['link']}: {e}")

                    ScrapedArticle.objects.create(
                        title=item['title'],
                        link=item['link'],
                        date_published=item['date'],
                        content=content
                    )
                    saved_count += 1

            except Exception as e:
                print(f"Error scraping article {item['link']}: {e}")

        driver.quit()
        return {"status": "success", "saved_count": saved_count}

    except Exception as e:
        try:
            driver.quit()
        except:
            pass
        return {"status": "error", "message": str(e)}
