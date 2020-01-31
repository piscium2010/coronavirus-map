import * as echarts from '../../ec-canvas/echarts';
import geoJson from './mapData.js';

const app = getApp()

Page({
  onShareAppMessage: function (res) {
    return {
      title: '实时冠状病毒疫情图',
      path: '/pages/index/index',
      success: function () { },
      fail: function () { }
    }
  },
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    ec: {},
    timer: '',
    overviewData: {
      confirmCount: 0,
      suspectCount: 0,
      cure: 0,
      deadCount: 0
    },
    data: null,
    tableData: null,
    updateTime: ''
  },
  onLoad: function (options) {
    var _this = this
    this.oneComponent = this.selectComponent('#mychart-dom-area');
    this.loadData();
    var timer = setInterval(function () {
      _this.loadData();
    }, 30000)
    this.setData({ timer })
  },
  onReady: function () {
  },
  onUnload: function () {
    clearInterval(this.data.timer)
  },
  initChart: function () {
    this.oneComponent.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      canvas.setChart(chart);
      echarts.registerMap('china', geoJson);

      const option = {
        tooltip: {
          show: false,
          trigger: 'item'
        },

        visualMap: {
          show: true,
          type: "piecewise",
          left: 0,
          bottom: "0",
          align: "left",
          itemWidth: 10,
          itemHeight: 10,
          textStyle: {
            fontSize: 10
          },
          pieces: [
            { min: 1000, label: '1000人以上', color: '#ED514E' },
            { min: 100, max: 999, label: '100-999人', color: '#FF8F66' },
            { min: 10, max: 99, label: '10-99人', color: '#FFB769' },
            { min: 1, max: 9, label: '1-9人', color: '#FFE6BD' }
          ]
        },
        series: [{
          type: 'map',
          mapType: 'china',
          label: {
            show: true,
            fontSize: 8
          },
          itemStyle: {
            normal: {
              borderColor: '#389BB7',
              areaColor: '#fff',
            },
            emphasis: {
              areaColor: '#389BB7',
              borderWidth: 0
            }
          },
          animation: false,
          data: this.data.data
        }]
      };
      chart.setOption(option);

      return chart;
    });
  },
  loadData: function () { //加载数据
    var _this = this
    wx.request({
      type: "get",
      dataType: 'jsonp',
      data: {},
      jsonp: "callback",
      jsonpCallback: "wuwei_ww_global_vars",
      url: 'https://view.inews.qq.com/g2/getOnsInfo?name=disease_h5&t=' + Date.now(),
      success: function (res) {
        const json = JSON.parse(res.data);
        const data = JSON.parse(json.data);
        const overview = data['chinaTotal']
        const areaTree = data['areaTree']
        const china = areaTree[0]
        const provinces = china['children']
        const provincesData = provinces.map(item => {
          return {
            name: item.name,
            value: item.total.confirm
          }
        })
        const detail = provinces.map(item => {
          return {
            area: item.name,
            ...item.total
          }
        })
        _this.setData({ overviewData: overview, data: provincesData, tableData: detail, updateTime: data.lastUpdateTime.substring(0, 10) })
        _this.initChart()
      },
      fail: function (res) {
        console.log(res)
      },
    })
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
});
