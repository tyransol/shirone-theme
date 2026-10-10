/**
 * 假统计生成器：基于文章 ID 和发布日期确定性计算模拟阅读量。
 *
 * 算法：
 * - 发布后前 hotDays 天：每日随机 1–hotDailyMax（高热度）
 * - 之后：每日随机 1–coldDailyMax（冷却期）
 * - 当天按 10 分钟粒度分配，每个时间片贡献不同值（增加随机性）
 * - 所有值由 hash(postId + date) 确定性生成
 *
 * 此模块同时被 SSR（UmamiStats.astro）和客户端（MockStatsRuntime 内联脚本）使用。
 */

type MockStatsComputeConfig = {
	hotDays: number;
	hotDailyMax: number;
	coldDailyMax: number;
};

/** FNV-1a 字符串哈希 → uint32 种子 */
function hashStr(s: string): number {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

/** Mulberry32 —— 确定性 PRNG */
function mulberry32(seed: number): () => number {
	return function () {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** 毫秒时间戳 → YYYY-MM-DD（UTC） */
function dateToISODate(ms: number): string {
	const d = new Date(ms);
	const y = d.getUTCFullYear();
	const m = String(d.getUTCMonth() + 1).padStart(2, "0");
	const day = String(d.getUTCDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

/**
 * 计算指定文章在指定时间点的模拟阅读量。
 */
export function computeMockViews(
	postId: string,
	publishedMs: number,
	nowMs: number,
	config: MockStatsComputeConfig,
): number {
	if (nowMs <= publishedMs) return 0;

	const msPerDay = 86400000;
	const daysSincePublish = Math.floor((nowMs - publishedMs) / msPerDay);

	let total = 0;

	// 已完成天数
	for (let d = 0; d < daysSincePublish; d++) {
		const dateStr = dateToISODate(publishedMs + d * msPerDay);
		const isHot = d < config.hotDays;
		const max = isHot ? config.hotDailyMax : config.coldDailyMax;
		const seed = hashStr(`${postId}:${dateStr}`);
		const rng = mulberry32(seed);
		total += Math.floor(rng() * max) + 1;
	}

	// 当天部分（按 10 分钟时间片分配）
	const todayStr = dateToISODate(nowMs);
	const now = new Date(nowMs);
	const slotIndex = Math.min(
		143,
		Math.floor((now.getUTCHours() * 60 + now.getUTCMinutes()) / 10),
	);
	const isHotToday = daysSincePublish < config.hotDays;
	const todayMax = isHotToday ? config.hotDailyMax : config.coldDailyMax;

	const slotSeed = hashStr(`${postId}:${todayStr}:slots`);
	const slotRng = mulberry32(slotSeed);
	const fractions: number[] = [];
	let fracTotal = 0;
	for (let i = 0; i < 144; i++) {
		fractions[i] = slotRng();
		fracTotal += fractions[i];
	}
	let partial = 0;
	for (let i = 0; i <= slotIndex; i++) {
		partial += fractions[i];
	}
	total += Math.round((partial / fracTotal) * todayMax);

	return total;
}

/** 访问次数 = 总阅读 ÷ visitRatio */
export function computeMockVisits(
	views: number,
	visitRatio: number,
): number {
	return Math.round(views / visitRatio);
}

/** 紧凑数字格式化（1.2万、345 等） */
export function formatMockCount(value: number): string {
	try {
		return new Intl.NumberFormat(undefined, {
			notation: "compact",
			compactDisplay: "short",
			maximumFractionDigits: 1,
		}).format(value);
	} catch {
		return String(value);
	}
}
