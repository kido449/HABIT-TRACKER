import requests
from bs4 import BeautifulSoup

#website URL to scrape
url = 'https://books.toscrape.com/'

#send a GET request to the website
response = requests.get(url)

#check if the request was successful
if response.status_code == 200:
    #parse the HTML content of the page
    soup = BeautifulSoup(response.content, 'html.parser')

    #find all book titles on the page
    book_titles = soup.find_all('h3')

    #print the titles of the books
    for title in book_titles:
        print(title.a['title'])