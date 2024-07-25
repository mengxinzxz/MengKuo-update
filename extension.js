//game.import(name: "活动萌扩",
import { lib, game, ui, get, ai, _status } from '../../noname.js';
import { config } from './js/config.js';
import { precontent } from './js/precontent.js';
import { content } from './js/content/index.js';
import { help } from './js/help.js';

lib.init.css(lib.assetURL + 'extension/活动萌扩', 'extension');

//更新公告
game.bolShowNewPackx = function () {
	//更新告示
	var HuoDong_update = [
		'活动萌扩模块化',
		'To be continued...',
	];
	//加载
	var dialog = ui.create.dialog(
		'<span class="text center">' +
		'新人制作扩展，希望大家支持<br>新人技术不足，希望大家包涵' +
		'<br>' +
		'活动萌扩 ' + lib.extensionPack.活动萌扩.version + ' 更新内容' +
		'</span>', 'hidden');
	for (var i = 0; i < HuoDong_update.length; i++) {
		var li = document.createElement('li');
		li.innerHTML = HuoDong_update[i];
		li.style.textAlign = 'left';
		dialog.content.appendChild(li);
	}
	dialog.open();
	var hidden = false;
	if (!ui.auto.classList.contains('hidden')) {
		ui.auto.hide();
		hidden = true;
	}
	game.pause();
	var control = ui.create.control('确定', function () {
		dialog.close();
		control.close();
		if (hidden) ui.auto.show();
		game.resume();
	});
};
var version = lib.config.extension_活动萌扩_HDversion;
if (!version || version != lib.extensionPack.活动萌扩.version) {
	lib.game.showChangeLog = function () {
		game.saveConfig('extension_活动萌扩_HDversion', lib.extensionPack.活动萌扩.version);
		game.bolShowNewPackx();
		lib.init.onfree();
	};
}

let extensionPackage = {
	name: "活动萌扩",
	editable: false,
	content: content,
	precontent: precontent,
	config: config,
	help: help,
	package: {
		intro: "活动武将分离系列之一，旨在补充部分活动场<br>当前萌币：" + lib.config.extension_活动萌扩_decade_Coin,
		author: '萌新（转型中）',
		diskURL: '',
		forumURL: '',
		version: '0.1.9',
		//新人制作扩展，希望大家支持。
		//新人技术不足，希望大家包涵。
		//壹、贰、叁、肆、伍、陆、柒、捌、玖、拾
	},
	files: {}
};

export let type = 'extension';
export default extensionPackage;