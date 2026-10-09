/**
 * 游戏展示页数据类型契约。
 *
 * 注：具体内容数据维护在内容仓 `data/games.ts`（物化为 `src/data/games.ts`），
 * 页面展示与筛选规则由 gamesConfig 控制（当前主题线未启用游戏页，类型先行，
 * 便于内容数据提前就位）。
 */

/** 游戏状态（页面徽标用） */
export type GameStatus = "playing" | "finished" | "backlog" | "shelved";

/** 游戏单项 */
export interface GameItem {
	/** 唯一标识（用于 DOM key 与筛选持久化） */
	id: string;
	/** 游戏名 */
	name: string;
	/** 开发商 */
	developer: string;
	/** 分类键（与页面筛选 chip 对应，如 open-world / sandbox） */
	category: string;
	/** 当前状态 */
	status: GameStatus;
	/** 封面：src/assets 相对路径 / /public 绝对路径 / 远程 URL */
	cover: string;
	/** 分类或状态图标（Iconify 名） */
	icon: string;
	/** 个人评分（0-5，支持 0.5 步进） */
	rating: number;
	/** 累计游玩时长（小时，可选） */
	hours?: number;
	/** 平台（PC / Switch / PS5 …） */
	platform: string;
	/** 发行或初玩年份 */
	year: string;
	/** 标签 */
	tags: string[];
	/** 一句话介绍 */
	description: string;
	/** 官网或商店页链接（可选） */
	link?: string;
	/** 是否置顶展示（可选） */
	featured?: boolean;
}
