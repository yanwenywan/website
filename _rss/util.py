from xml.dom.minidom import Element
from bs4 import BeautifulSoup, ResultSet
from email.utils import format_datetime
import bs4
import xml.etree.ElementTree as etree
import datetime
import os

def make_text_sub_element(parent:Element, name:str, text:str, attrib:dict[str, str]=dict(), **extra:str):
    tag = etree.SubElement(parent, name, attrib, **extra)
    tag.text = text


def create_blank_rss():
    rss = etree.Element("rss", version="2.0")
    channel = etree.SubElement(rss, "channel")
    make_text_sub_element(channel, "title", "大奉打更人 Nightwatchers of Feng - Yanwenyuan")
    make_text_sub_element(channel, "link", "https://yanwenyuan.uk/dagengren/")
    make_text_sub_element(channel, "description", "Nightwatchers of Feng by Paperboy, translated by Daoist Yan")
    
    return rss, channel


def create_item(url:str, title:str, description:str, pubdate:datetime.datetime) -> Element:
    item = etree.Element("item")    
    make_text_sub_element(item, "title", title)
    make_text_sub_element(item, "link", url)
    make_text_sub_element(item, "description", description)
    make_text_sub_element(item, "pubDate", format_datetime(pubdate))
    make_text_sub_element(item, "guid", url, dict(isPermaLink="true"))
    return item
    

def get_chapter_lists(html_page_path:str) -> ResultSet[bs4.element.Tag]:
    with open(html_page_path, 'r', encoding='utf-8') as file:
        soup = BeautifulSoup(file, 'html.parser')
    return soup.find_all("ol")
    
