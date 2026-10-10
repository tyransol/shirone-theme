import type { MockStatsConfig, ResolvedMockStatsOptions } from "@/types/mockStatsConfig";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * 假统计配置单一真源。
 *
 * 遵循「零额外负担」原则：默认全局关闭（enable: false），
 * 在未开启时不产生任何外部网络请求、零额外 DOM 占位与零包体积膨胀。
 *
 * 启用时：在文章页和头像卡展示基于文章发布日期确定性计算的假阅读/访问数据，
 * 客户端脚本每 10 分钟自动刷新当前值。SSR 先输出基线数字保证无 JS 也能显示。
 */
export const mockStatsConfig: MockStatsConfig = withUserConfig("mockStats", {
	/** 全局假统计总开关 */
	enable: false,
	/** 发布后高热度天数（此期间每日随机 1–hotDailyMax） */
	hotDays: 15,
	/** 高热度期每日阅读上限 */
	hotDailyMax: 520,
	/** 冷却期每日阅读上限 */
	coldDailyMax: 10,
	/** 访问次数 = 总阅读 ÷ visitRatio */
	visitRatio: 7,
});

/**
 * 解析并校验假统计配置。未启用时返回 null。
 */
export function resolveMockStatsOptions(
	config: MockStatsConfig,
): ResolvedMockStatsOptions {
	if (!config.enable) {
		return null;
	}
	return {
		hotDays: config.hotDays,
		hotDailyMax: config.hotDailyMax,
		coldDailyMax: config.coldDailyMax,
		visitRatio: config.visitRatio,
	};
}

export type { ResolvedMockStatsOptions };
