from xml.etree.ElementTree import Element
from bs4 import BeautifulSoup, ResultSet
from typing import Union
import bs4
import xml.etree.ElementTree as etree
import os


def CDATA(text=None):
    element = etree.Element('![CDATA[')
    element.text = text
    return element


def make_text_sub_element(parent:Element, name:str, text:Union[str, None]=None, attrib:dict[str, str]=dict(), **extra:str):
    tag = etree.SubElement(parent, name, attrib, **extra)
    tag.text = text
    return tag
    

def get_chapter_lists(html_page_path:str) -> ResultSet[bs4.element.Tag]:
    with open(html_page_path, 'r', encoding='utf-8') as file:
        soup = BeautifulSoup(file, 'html.parser')
    return soup.find_all("ol")
