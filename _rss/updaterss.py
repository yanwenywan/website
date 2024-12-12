from datetime import datetime
from functools import cached_property
from pathlib import Path
from xml.etree.ElementTree import Element
from bs4 import Tag, ResultSet
import bs4
import xml.etree.ElementTree as etree
import os
import util

BASE_URL = "https://yanwenyuan.uk/"



class DagengrenWriter:
    BASE_PATH = str(Path.home()) + "/Documents/yanwenyuan/website/dagengren/"
    DGR_OUT = BASE_PATH + "rss.xml"
    
    def __init__(self):
        self.log("initialising RSS Writer for Dagengren...")
        
        # TODO is this necessary?
        # self.existing_feed = None
        
        # try: 
        #     if os.path.exists(self.DGR_OUT):
        #         self.log("found existing rss file")
        #         self.existing_feed = etree.parse(self.DGR_OUT)
        # except Exception as e:
        #     self.log("ERROR: Failed to parse file")
        #     self.log(e)

    def write(self):
        feed, channel = util.create_blank_rss()
        
        self.add_volumes(channel)
    
        self.log(f"writing file to {self.DGR_OUT}")
        
        feedTree = etree.ElementTree(feed)
        etree.indent(feedTree, space="\t", level=0)
        feedTree.write(self.DGR_OUT, xml_declaration=True, encoding="utf-8", short_empty_elements=False)

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
            
            chapter_link = self.absolutise_chapter_url(link.get("href"))
            chapter_name = link.text.strip()
            chapter_file_path = self.get_path_from_link(chapter_link)
            
            if not chapter_file_path:
                self.log(f"ERROR: file {chapter_file_path} from chapter link {chapter_link} does not exist! Skipping")
                continue
            
            feed.append(util.create_item(
                chapter_link,
                chapter_name,
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
