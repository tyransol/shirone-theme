/**
 * 假统计配置类型。
 *
 * 当 Umami 未启用时，可启用此项以展示基于文章发布日期
 * 确定性计算的模拟阅读/访问数据。客户端脚本每 10 分钟自动刷新。
 */
export type MockStatsConfig = {
	/** 全局假统计总开关：false 时完全不加载运行时脚本与 DOM */
	enable: boolean;
	/** 发布后高热度天数（此期间每日随机 1–hotDailyMax） */
	hotDays: number;
	/** 高热度期每日阅读上限 */
	hotDailyMax: number;
	/** 冷却期每日阅读上限 */
	coldDailyMax: number;
	/** 访问次数 = 总阅读 ÷ visitRatio */
	visitRatio: number;
};

/**
 * 解析后的假统计配置选项。
 */
export type ResolvedMockStatsOptions = {
	hotDays: number;
	hotDailyMax: number;
	coldDailyMax: number;
	visitRatio: number;
} | null;
