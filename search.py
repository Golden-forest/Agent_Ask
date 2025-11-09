"""
Web搜索模块 - 集成Serper API进行实时网络搜索
为需求澄清助手提供实时信息支持
"""

import os
import requests
import json
from typing import List, Dict, Optional
from dotenv import load_dotenv
import logging

load_dotenv()

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebSearcher:
    """Web搜索器类"""

    def __init__(self):
        """初始化搜索器"""
        self.api_key = os.getenv("SERPER_API_KEY")
        self.base_url = "https://google.serper.dev/search"

        if not self.api_key:
            logger.warning("SERPER_API_KEY未配置，Web搜索功能将被禁用")
            self.enabled = False
        else:
            self.enabled = True
            logger.info("Web搜索功能已启用")

    def search(self, query: str, num_results: int = 5) -> List[Dict]:
        """
        执行Web搜索

        Args:
            query: 搜索关键词
            num_results: 返回结果数量

        Returns:
            搜索结果列表，每个结果包含标题、链接、摘要等信息
        """
        if not self.enabled:
            return []

        try:
            headers = {
                'X-API-KEY': self.api_key,
                'Content-Type': 'application/json'
            }

            payload = {
                'q': query,
                'num': num_results,
                'hl': 'zh-cn',  # 中文搜索
                'gl': 'cn'     # 中国地区
            }

            response = requests.post(
                self.base_url,
                headers=headers,
                json=payload,
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                return self._parse_results(data)
            else:
                logger.error(f"搜索请求失败: {response.status_code} - {response.text}")
                return []

        except requests.exceptions.RequestException as e:
            logger.error(f"搜索请求异常: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"搜索处理异常: {str(e)}")
            return []

    def _parse_results(self, data: Dict) -> List[Dict]:
        """解析搜索结果"""
        results = []

        # 解析常规搜索结果
        if 'organic' in data:
            for item in data['organic']:
                result = {
                    'title': item.get('title', ''),
                    'link': item.get('link', ''),
                    'snippet': item.get('snippet', ''),
                    'displayed_link': item.get('displayedLink', ''),
                    'type': 'organic'
                }
                results.append(result)

        # 解析知识图谱结果
        if 'knowledgeGraph' in data:
            kg = data['knowledgeGraph']
            result = {
                'title': kg.get('title', ''),
                'link': kg.get('website', ''),
                'snippet': kg.get('description', ''),
                'displayed_link': '知识图谱',
                'type': 'knowledge_graph'
            }
            results.insert(0, result)

        # 解析相关问题
        if 'peopleAlsoAsk' in data:
            related_questions = []
            for item in data['peopleAlsoAsk'][:3]:  # 只取前3个相关问题
                related_questions.append(item.get('question', ''))

            if related_questions:
                results.append({
                    'title': '相关问题',
                    'link': '',
                    'snippet': '\n'.join(f"• {q}" for q in related_questions),
                    'displayed_link': '推荐',
                    'type': 'related_questions'
                })

        return results

    def format_search_results(self, results: List[Dict]) -> str:
        """
        格式化搜索结果为文本

        Args:
            results: 搜索结果列表

        Returns:
            格式化后的文本
        """
        if not results:
            return "未找到相关搜索结果"

        formatted_text = "**网络搜索结果：**\n\n"

        for i, result in enumerate(results, 1):
            if result['type'] == 'knowledge_graph':
                formatted_text += f"### {result['title']}\n"
                formatted_text += f"{result['snippet']}\n\n"
                if result['link']:
                    formatted_text += f"[了解更多]({result['link']})\n\n"

            elif result['type'] == 'related_questions':
                formatted_text += f"### 相关问题\n"
                formatted_text += f"{result['snippet']}\n\n"

            else:  # organic results
                formatted_text += f"**{i}. {result['title']}**\n"
                formatted_text += f"{result['snippet']}\n"
                formatted_text += f"{result['displayed_link']}\n\n"

        return formatted_text

    def search_for_requirement_context(self, requirement: str) -> str:
        """
        为需求澄清搜索相关背景信息

        Args:
            requirement: 用户需求描述

        Returns:
            搜索结果的格式化文本
        """
        if not self.enabled:
            return ""

        # 构建搜索关键词
        search_keywords = self._extract_search_keywords(requirement)

        all_results = []
        for keyword in search_keywords:
            results = self.search(keyword, num_results=3)
            all_results.extend(results)

        # 去重和排序
        unique_results = self._deduplicate_results(all_results)

        return self.format_search_results(unique_results[:5])  # 最多返回5个结果

    def _extract_search_keywords(self, requirement: str) -> List[str]:
        """从需求描述中提取搜索关键词"""
        # 简单的关键词提取逻辑
        keywords = []

        # 移除常见的停用词
        stop_words = {'我', '想', '做', '开发', '一个', '项目', '网站', '应用', '系统', '平台'}
        words = requirement.split()

        # 保留有意义的词汇
        meaningful_words = [word for word in words if word not in stop_words and len(word) > 1]

        if meaningful_words:
            # 构建多个搜索关键词组合
            if len(meaningful_words) >= 2:
                keywords.append(" ".join(meaningful_words[:2]))
                keywords.append(" ".join(meaningful_words[-2:]))
            else:
                keywords.append(meaningful_words[0])

            # 添加行业相关的搜索词
            keywords.append(f"{meaningful_words[0]} 最佳实践")
            keywords.append(f"{meaningful_words[0]} 开发指南")

        return keywords[:3]  # 最多返回3个关键词

    def _deduplicate_results(self, results: List[Dict]) -> List[Dict]:
        """去除重复的搜索结果"""
        seen_links = set()
        unique_results = []

        for result in results:
            link = result['link']
            if link not in seen_links:
                seen_links.add(link)
                unique_results.append(result)

        return unique_results


# 全局搜索器实例
web_searcher = WebSearcher()


def search_web(query: str, num_results: int = 5) -> str:
    """
    便捷的Web搜索函数

    Args:
        query: 搜索关键词
        num_results: 返回结果数量

    Returns:
        格式化的搜索结果
    """
    results = web_searcher.search(query, num_results)
    return web_searcher.format_search_results(results)


def search_requirement_context(requirement: str) -> str:
    """
    为需求澄清搜索背景信息

    Args:
        requirement: 用户需求描述

    Returns:
        相关背景信息的搜索结果
    """
    return web_searcher.search_for_requirement_context(requirement)


if __name__ == "__main__":
    # 测试搜索功能
    test_queries = [
        "Python Web开发最佳实践",
        "React应用架构设计",
        "数据分析项目开发流程"
    ]

    for query in test_queries:
        print(f"\n搜索: {query}")
        print("=" * 50)
        results = search_web(query)
        print(results)
        print("\n" + "=" * 50)