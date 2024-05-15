from os import name
import requests
import fake_useragent
from bs4 import BeautifulSoup
import time
import json


def get_links(text):
    ua = fake_useragent.UserAgent()
    res = requests.get(
        url=f"https://hh.ru/search/resume?relocation=living_or_relocation&gender=unknown&text={text}&isDefaultArea=true&exp_period=all_time&logic=normal&pos=full_text&fromSearchLine=false&search_period=0",
        headers={"user-agent":ua.random}
    )
    print(res.content)


if __name__ == "__main__":  
    get_links("backend")