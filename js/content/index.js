import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import bolbingjingliangzu from './bolbingjingliangzu.js';
import bolxingyunsixsixsix from './bolxingyunsixsixsix.js';
import boldecadeDouDiZhu from './boldecadeDouDiZhu.js';
import boldecadeDouDiZhu2 from './boldecadeDouDiZhu2.js';
import OLdoubleThree from './OLdoubleThree.js';
import bol_longzhou from './bol_longzhou.js';
import bol_qingqiu from './bol_qingqiu.js';
import bol_whlw from './bol_whlw.js';
import bol_zhuhou from './bol_zhuhou.js';
import bol_zhugongsha from './bol_zhugongsha.js';
import bol_xuezhan from './bol_xuezhan.js';
import bolPVZ from './bolPVZ.js';
import bolLongZhouRe from './bolLongZhouRe.js';
import bolWechatDouDiZhu from './bolWechatDouDiZhu.js';
import bolWechatDouDiZhu2 from './bolWechatDouDiZhu2.js';
import bol_longzhoux from './bol_longzhoux.js';
import bilibili_wuhuang from './bilibili_wuhuang.js';
import bol_kunyangzhizhan from './bol_kunyangzhizhan.js';
import ol_characterTest from './ol_characterTest.js';
import ol_hezongkangqin from './ol_hezongkangqin.js';

export function content(config, pack) {
	//更新公告
	var version = lib.config.extension_活动萌扩_HDversion;
	if (!version || version != lib.extensionPack.活动萌扩.version) {
		lib.game.showChangeLog = function () {
			game.saveConfig('extension_活动萌扩_HDversion', lib.extensionPack.活动萌扩.version);
			game.bolShowNewPackx();
			lib.init.onfree();
		};
	}
	//十周年斗地主初加载
	if (lib.config.extension_活动萌扩_decade_Coin_game) {
		var num = (lib.config.extension_活动萌扩_decade_Coin_Gaming + 10);
		game.bolSay('您于上一场斗地主逃跑了，失去' + num + '萌币');
		game.saveConfig('extension_活动萌扩_decade_Coin_game', null);
		game.saveConfig('extension_活动萌扩_decade_Coin', lib.config.extension_活动萌扩_decade_Coin - num);
	}
	if (!lib.config.extension_活动萌扩_decade_Coin || lib.config.extension_活动萌扩_decade_Coin == 'NaN') {
		game.saveConfig('extension_活动萌扩_decade_Coin', 1000);
		var date = new Date();
		var time = {
			year: date.getFullYear(),
			month: date.getMonth() + 1,
			day: date.getDate(),
		};
		game.saveConfig('extension_活动萌扩_decade_Coin_Time', time);
		game.bolSay('非常感谢对《活动萌扩》扩展的支持，安装本扩展后第一次进入无名杀获得1000萌币，可以在无名杀乱斗页面的新斗地主模式使用');
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
			game.bolSay('每日进入无名杀获得300萌币，可以在无名杀乱斗页面的新斗地主模式使用');
		}
	}
	if (lib.config.extension_活动萌扩_DDZname && lib.config.extension_活动萌扩_decade_Coin < 500) {
		game.saveConfig('extension_活动萌扩_DDZname', false);
		game.bolSay('您的萌币已经不足500，已为您自动关闭新服斗地主特定将池使用');
	}
	//载入模式
	if (!lib.brawl) return;
	//斗地主
	lib.brawl.boldecadeDouDiZhu = boldecadeDouDiZhu;
	lib.brawl.boldecadeDouDiZhu2 = boldecadeDouDiZhu2;
	lib.brawl.bolWechatDouDiZhu = bolWechatDouDiZhu;
	lib.brawl.bolWechatDouDiZhu2 = bolWechatDouDiZhu2;
	//OL活动场
	lib.brawl.bol_zhuhou = bol_zhuhou;
	lib.brawl.ol_hezongkangqin = ol_hezongkangqin;
	lib.brawl.bol_longzhou = bol_longzhou;
	lib.brawl.bol_longzhoux = bol_longzhoux;
	lib.brawl.bolLongZhouRe = bolLongZhouRe;
	lib.brawl.bol_zhugongsha = bol_zhugongsha;
	lib.brawl.OLdoubleThree = OLdoubleThree;
	lib.brawl.bolbingjingliangzu = bolbingjingliangzu;
	lib.brawl.bolxingyunsixsixsix = bolxingyunsixsixsix;
	lib.brawl.ol_characterTest = ol_characterTest;
	//十周年活动场
	lib.brawl.bol_whlw = bol_whlw;
	lib.brawl.bol_xuezhan = bol_xuezhan;
	//手杀活动场
	lib.brawl.bol_qingqiu = bol_qingqiu;
	lib.brawl.bol_kunyangzhizhan = bol_kunyangzhizhan;
	//其他活动场
	lib.brawl.bolPVZ = bolPVZ;
	lib.brawl.bilibili_wuhuang = bilibili_wuhuang;
}