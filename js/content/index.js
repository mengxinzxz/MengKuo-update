import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import bol_bingjingliangzu from './bol_bingjingliangzu.js';
import bol_xingyunsixsixsix from './bol_xingyunsixsixsix.js';
import bol_decadeDouDiZhu2 from './bol_decadeDouDiZhu2.js';
import bol_doubleThree from './bol_doubleThree.js';
import bol_qingqiu from './bol_qingqiu.js';
import bol_whlw from './bol_whlw.js';
import bol_zhuhou from './bol_zhuhou.js';
import bol_zhugongsha from './bol_zhugongsha.js';
import bol_xuezhan from './bol_xuezhan.js';
import bol_PVZ from './bol_PVZ.js';
import bol_longzhouold from './bol_longzhouold.js';
import bol_WechatDouDiZhu from './bol_WechatDouDiZhu.js';
import bol_WechatDouDiZhu2 from './bol_WechatDouDiZhu2.js';
import bol_longzhou from './bol_longzhou.js';
import bol_wuhuang from './bol_wuhuang.js';
import bol_kunyangzhizhan from './bol_kunyangzhizhan.js';
import bol_characterTest from './bol_characterTest.js';
import bol_hezongkangqin from './bol_hezongkangqin.js';
export function content(config, pack) {
	//更新公告
	var version = lib.config.extension_活动萌扩_HDversion;
	if (!version || version != lib.extensionPack.活动萌扩.version) {
		lib.game.showChangeLog = function () {
			game.saveConfig('extension_活动萌扩_HDversion', lib.extensionPack.活动萌扩.version);
			game.bol_showNewPackx();
			lib.init.onfree();
		};
	}
	//萌币初加载
	if (lib.config.extension_活动萌扩_decade_Coin === undefined || lib.config.extension_活动萌扩_decade_Coin == 'NaN') {
		game.saveConfig('extension_活动萌扩_decade_Coin', 1000);
		var date = new Date();
		var time = {
			year: date.getFullYear(),
			month: date.getMonth() + 1,
			day: date.getDate(),
		};
		game.saveConfig('extension_活动萌扩_decade_Coin_Time', time);
		game.bol_say('非常感谢对《活动萌扩》扩展的支持，安装本扩展后第一次进入无名杀获得1000萌币');
	}
	else {
		var date = new Date();
		var time = {
			year: date.getFullYear(),
			month: date.getMonth() + 1,
			day: date.getDate(),
		};
		var timex = lib.config.extension_活动萌扩_decade_Coin_Time;
		if (!timex || time.year != timex.year || time.month != timex.month || time.day != timex.day) {
			game.saveConfig('extension_活动萌扩_decade_Coin', lib.config.extension_活动萌扩_decade_Coin + 300);
			game.saveConfig('extension_活动萌扩_decade_Coin_Time', time);
			game.bol_say('每日进入无名杀获得300萌币');
		}
	}
	//init/uninit对武将牌堆的修改
	const originInit = lib.element.player.init;
	lib.element.player.init = function () {
		let player = this, names = get.nameList(player);
		if (_status.characterlist && names?.length) _status.characterlist.addArray(names);
		player = originInit.apply(this, arguments), names = get.nameList(player);
		if (_status.characterlist && names?.length) _status.characterlist.removeArray(names);
		return player;
	};
	const originUnInit = lib.element.player.uninit;
	lib.element.player.uninit = function () {
		let player = this, names = get.nameList(player);
		if (_status.characterlist && names?.length) _status.characterlist.addArray(names);
		player = originUnInit.apply(this, arguments);
		return player;
	};
	//载入模式
	if (!lib.brawl) return;
	//斗地主
	lib.brawl.bol_decadeDouDiZhu2 = bol_decadeDouDiZhu2;
	lib.brawl.bol_WechatDouDiZhu = bol_WechatDouDiZhu;
	lib.brawl.bol_WechatDouDiZhu2 = bol_WechatDouDiZhu2;
	//OL活动场
	lib.brawl.bol_zhuhou = bol_zhuhou;
	lib.brawl.bol_hezongkangqin = bol_hezongkangqin;
	lib.brawl.bol_longzhouold = bol_longzhouold;
	lib.brawl.bol_longzhou = bol_longzhou;
	lib.brawl.bol_zhugongsha = bol_zhugongsha;
	lib.brawl.bol_doubleThree = bol_doubleThree;
	lib.brawl.bol_bingjingliangzu = bol_bingjingliangzu;
	lib.brawl.bol_xingyunsixsixsix = bol_xingyunsixsixsix;
	lib.brawl.bol_characterTest = bol_characterTest;
	//十周年活动场
	lib.brawl.bol_whlw = bol_whlw;
	lib.brawl.bol_xuezhan = bol_xuezhan;
	//手杀活动场
	lib.brawl.bol_qingqiu = bol_qingqiu;
	lib.brawl.bol_kunyangzhizhan = bol_kunyangzhizhan;
	//其他活动场
	lib.brawl.bol_PVZ = bol_PVZ;
	lib.brawl.bol_wuhuang = bol_wuhuang;
}