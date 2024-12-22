from datetime import datetime
from functools import cached_property
from pathlib import Path
from xml.etree.ElementTree import Element
from bs4 import Tag, ResultSet
from email.utils import format_datetime
import bs4
import xml.etree.ElementTree as etree
import os
import util

BASE_URL = "https://yanwenyuan.uk/"

# required for including CDATA in output
etree._original_serialize_xml = etree._serialize_xml  # type:ignore
def _serialize_xml(write, elem, qnames, namespaces, **kwargs):
    if elem.tag == '![CDATA[':
        write("<%s%s]]>" % (elem.tag, elem.text))
        write(elem.tail)
        return
    return etree._original_serialize_xml(   # type:ignore
        write, elem, qnames, namespaces, **kwargs)
etree._serialize_xml = etree._serialize['xml'] = _serialize_xml  # type:ignore


class DagengrenWriter:
    BASE_PATH = str(Path.home()) + "/Documents/yanwenyuan/website/dagengren/"
    DGR_OUT = BASE_PATH + "rss.xml"
    
    def __init__(self):
        self.log("initialising RSS Writer for Dagengren...")

    def write(self):
        feed, channel = self.create_blank_rss()
        
        self.add_volumes(channel)
    
        self.log(f"writing file to {self.DGR_OUT}")
        
        feedTree = etree.ElementTree(feed)
        etree.indent(feedTree, space="\t", level=0)
        feedTree.write(self.DGR_OUT, xml_declaration=True, encoding="utf-8")

    def add_volumes(self, feed:Element):
        lists = util.get_chapter_lists(self.BASE_PATH + "index.html")
        
        volume_num = len(lists)
        for ol in reversed(lists):
            list_items = ol.find_all("li")
            self.log(f"Found list with {len(list_items)} items")
            
            if not self.likely_to_be_volume(list_items):
                self.log(f"WARN: Determined list {ol} is unlikely to contain chapters")
                continue
            
            self.add_chapters(feed, list_items, volume_num)
            volume_num -= 1
        
    def likely_to_be_volume(self, list_items:ResultSet[Tag]):
        return not (list_items[0].find("a") is None)
    
    def add_chapters(self, feed:Element, volume_list:ResultSet[Tag], volume_num:int): 
        chapter = len(volume_list)
        
        for li in reversed(volume_list):
            link = li.find("a")
            
            if link is None:
                self.log(f"ERROR: {li} does not contain a link tag. Skipping")
                continue
            
            chapter_link = self.absolutise_chapter_url(link.get("href"))  # type: ignore
            chapter_name = link.text.strip()
            chapter_file_path = self.get_path_from_link(chapter_link)
            
            if not chapter_file_path:
                self.log(f"ERROR: file {chapter_file_path} from chapter link {chapter_link} does not exist! Skipping")
                continue
            
            feed.append(self.create_item(
                chapter_link,
                f"v{volume_num}c{chapter}: {chapter_name}",
                f"Volume {volume_num} Chapter {chapter}",
                datetime.fromtimestamp(os.path.getctime(chapter_file_path))
            ))
            
            chapter -= 1

    def absolutise_chapter_url(self, chapter_url:str) -> str:
        if chapter_url.startswith("./"):
            return BASE_URL + "dagengren/" + chapter_url[2:]
        elif chapter_url.startswith("/"):
            return BASE_URL + chapter_url[1:]
        self.log(f"WARN: Chapter url {chapter_url} is not a relative ./ or an absolute from root / URL")
        return chapter_url
    
    def get_path_from_link(self, chapter_link:str) -> str:
        # https://yanwenyuan.uk/dagengren/story/X.html
        split_link = chapter_link.split("/")
        file_path = self.BASE_PATH + "/".join(split_link[4:])
        
        if not os.path.exists(file_path):
            return ""
        
        return file_path

    @staticmethod
    def create_blank_rss():
        rss = etree.Element("rss", version="2.0")
        channel = etree.SubElement(rss, "channel")
        util.make_text_sub_element(channel, "title", "大奉打更人 Nightwatchers of Feng - Yanwenyuan")
        util.make_text_sub_element(channel, "link", "https://yanwenyuan.uk/dagengren/")
        util.make_text_sub_element(channel, "description", "Nightwatchers of Feng by Paperboy, translated by Daoist Yan")  # type:ignore
        
        return rss, channel
    
    @staticmethod
    def create_item(url:str, title:str, description:str, pubdate:datetime) -> Element:
        item = etree.Element("item")    
        util.make_text_sub_element(item, "title", title)
        util.make_text_sub_element(item, "link", url)
        util.make_text_sub_element(item, "description", description)
        util.make_text_sub_element(item, "pubDate", format_datetime(pubdate))
        util.make_text_sub_element(item, "guid", url, dict(isPermaLink="true"))
        category = util.make_text_sub_element(item, "category")
        category.append(util.CDATA("Nightwatcher"))
        return item

    @staticmethod
    def dgr_chapter(number:int):
        return f"https://yanwenyuan.uk/dagengren/story/{number}.html"
    
    @staticmethod
    def log(*data, **extras):
        print("[DGR]", *data, **extras)
    





def main():
    dgr = DagengrenWriter()
    dgr.write()


if __name__ == "__main__":
    main()
