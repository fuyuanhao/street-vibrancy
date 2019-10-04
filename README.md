# 武汉市街道活力分析原型系统

Explore the street vibrancy of Wuhan quantitatively.

关键词：街道城市主义 | 街道活力 | 武汉

Keywords Street urbanism | Street vibrancy | Wuhan

## B/S系统架构

| Layer | Content |
|:-------:|:------|
| 应用层(Browser) | 用户交互界面，地图 + 图表的形式直观展示给用户 |
| 表现层(Web server) | 支持应用层功能与界面的技术与框架，支持地图开发的Leaflet框架orArcGIS API for JavaScript, 支持图表操作的Echarts框架，以及用于页面设计和美化的Bootstrap框架，实现数据异步请求的Ajax框架，还有用于网页设计与实现的HTML、CSS、JavaScript等语言； |
| 服务层(GIS server) | 联系前端网页、地图与后端数据库的桥梁，本项目采用Node.js支持的Express框架来实现前后端属性数据通信，利用GeoServer将后端的地图数据发布为网络地图服务供前端请求； |
| 数据层（Database server） | 主要负责数据的编辑和存储，空间数据使用QGIS进行编辑、通过PostGIS将空间数据存储于PostgreSQL中供GIS服务器调用，属性数据直接以关系数据库的方式存储于PostgreSQL中 |

## 软件工具

* 云服务器控制：PuTTY
* 云服务器文件传输：FileZilla
* 单个文件编辑器：NotePad++
* Web项目开发编译器：WebStorm
* 项目版本管理器：git
* Chrome开发插件：Postman

## 研究范围

## 数据来源

## 街道和活力的定义
  将街道界定为城市范围内、非交通为主、能承载人们日常社交生活的道路，包括道路红线范围、对街道活力有直接影响的建筑底层商铺、小的开敞空间等。街道的活力定义为街道的社会活力，其核心为街上从事各种活动的人。

## 构建指标体系

## 参考文献
[1]. 李中元，轻量级WebGIS入门实践教程

[2]. 郝新华, 龙瀛, 石淼, et al. 北京街道活力:测度、影响因素与规划设计启示[J]. 上海城市规划, 2016(3):37-45.

[3]. https://www.freecodecamp.org/

