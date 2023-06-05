<template>
	<view>
		<view class="search-box">
			<my-search @click="gotoSearch"></my-search>
		</view>
		<!-- 轮播图 -->
		<swiper :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000" :circular="true">
			<swiper-item v-for="(item,i) in swiperList" :key="i">
				<navigator class="swiper-item" :url="'/subpkg/goods_detail/goods_detail?goods_id=' + item.goods_id">
					<image :src="item.image_src"></image>
				</navigator>
			</swiper-item>
		</swiper>

		<!-- 分类导航区域 -->
		<view class="nav-list">
			<view class="nav-item" v-for="(item, i) in navList" :key="i" @click="navClickHandler(item)">
				<image :src="item.image_src" class="nav-img"></image>
			</view>
		</view>

		<!-- 楼层区域 -->
		<view class="floor-list">
			<!-- 楼层 item 项 -->
			<view class="floor-item" v-for="(item, i) in floorList" :key="i">
				<!-- 楼层标题 -->
				<image :src="item.floor_title.image_src" class="floor-title"></image>
				<!-- 楼层图片区域 -->
				<view class="floor-img-box">
					<!-- 左侧大图片的盒子 -->
					<navigator class="left-img-box" :url="item.product_list[0].url">
						<image :src="item.product_list[0].image_src"
							:style="{width: item.product_list[0].image_width + 'rpx'}" mode="widthFix"></image>
					</navigator>
					<!-- 右侧 4 个小图片的盒子 -->
					<view class="right-img-box">
						<navigator class="right-img-item" v-for="(item2, i2) in item.product_list" :key="i2"
							v-if="i2 !== 0" :url="item2.url">
							<image :src="item2.image_src" mode="widthFix" :style="{width: item2.image_width + 'rpx'}">
							</image>
						</navigator>
					</view>
				</view>
			</view>

		</view>

		<uni-popup ref="popup" type="bottom" background-color="#fff">
			<view class="popup-content" :class="{ 'popup-height': type === 'left' || type === 'right' }"><text
					class="text">很遗憾，没有这个页面:{{itemName}}</text></view>
		</uni-popup>

	</view>


</template>

<script>
	// 导入自己封装的 mixin 模块
	import badgeMix from '@/mixins/tabbar-badge.js'
	export default {
		mixins: [badgeMix],
		data() {
			return {
				// 轮播图的数据列表
				swiperList: [],
				//  分类导航的数据列表
				navList: [],
				//  楼层的数据列表
				floorList: [],
				itemName: ''
			};
		},
		onLoad() {
			this.getSwiperList()
			this.getNavList()
			this.getFloorList()
		},
		methods: {
			async getSwiperList() {
				const {
					data: res
				} = await uni.$http.get('/api/home/swiperdata')
				// console.log(res)
				if (res.meta.status !== 200) {
					return uni.$showMsg()
				}
				this.swiperList = res.message
				// console.log(this.swiperList)
				// uni.$showMsg("数据请求成功")
			},
			async getNavList() {
				const {
					data: res
				} = await uni.$http.get('/api/home/catitems')
				// console.log(res)
				if (res.meta.status !== 200) return uni.$showMsg()
				this.navList = res.message
			},
			//  定义获取楼层列表数据的方法
			async getFloorList() {
				const {
					data: res
				} = await uni.$http.get('/api/home/floordata')
				if (res.meta.status !== 200) return uni.$showMsg()

				// 通过双层 forEach 循环，处理 URL 地址
				res.message.forEach(floor => {
					floor.product_list.forEach(prod => {
						prod.url = '/subpkg/goods_list/goods_list?' + prod.navigator_url.split('?')[1]
					})
				})
				this.floorList = res.message
				// console.log('floorList')
				// console.log(this.floorList)
			},
			// nav-item 项被点击时候的事件处理函数
			navClickHandler(item) {
				// 判断点击的是哪个 nav
				console.log("你点击了" + item.name)
				if (item.name === '分类') {
					uni.switchTab({
						url: '/pages/cate/cate'
					})
				} else {
					this.itemName = item.name
					this.$refs.popup.open('center')
					console.log("你点击了%s，但是没有这个页面", item.name)
				}
			},
			gotoSearch() {
				uni.navigateTo({
					url: '/subpkg/search/search'
				})
			}
		}
	}
</script>

<style lang="scss">
	swiper {
		height: 330rpx;

		.swiper-item,
		image {
			width: 100%;
			height: 100%;
		}
	}

	.nav-list {
		display: flex;
		justify-content: space-around;
		margin: 15px 0;

		.nav-img {
			width: 128rpx;
			height: 140rpx;
		}
	}

	.floor-title {
		height: 60rpx;
		width: 100%;
		display: flex;
	}

	.right-img-box {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
	}

	.floor-img-box {
		display: flex;
		padding-left: 10rpx;
	}

	.search-box {
		// 设置定位效果为“吸顶”
		position: sticky;
		// 吸顶的“位置”
		top: 0;
		// 提高层级，防止被轮播图覆盖
		z-index: 1;
	}

	.popup-content {
		align-items: center;
		justify-content: center;
		padding: 15px;
		height: 50px;
		background-color: #fff;
		font-size: 18px;
	}
</style>