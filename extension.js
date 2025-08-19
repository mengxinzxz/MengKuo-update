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
	let HuoDong_update = [
		'修复部分模式因态度判定和敌友判定引发的弹窗bug',
		'修复昆阳之战刘秀拥有信念标记无法触发休整的bug',
		'修复部分可选择同名替换武将的模式可替换出未开启武将的bug',
		'To be continued...',
	];
	//加载
	let dialog = ui.create.dialog(`<span class="text center">${[
		'新人制作扩展，希望大家支持<br>新人技术不足，希望大家包涵',
		'<a href="https://github.com/mengxinzxz/MengKuo-update">点击前往活动萌扩Github仓库</a>',
		`活动萌扩 ${lib.extensionPack.活动萌扩.version} 更新内容`,
	].join('<br>')}</span>`, 'hidden');
	for (let i = 0; i < HuoDong_update.length; i++) {
		let li = document.createElement('li');
		li.innerHTML = HuoDong_update[i];
		li.style.textAlign = 'left';
		dialog.content.appendChild(li);
	}
	dialog.open();
	let hidden = false;
	if (!ui.auto.classList.contains('hidden')) {
		ui.auto.hide();
		hidden = true;
	}
	game.pause();
	let control = ui.create.control('确定', function () {
		dialog.close();
		control.close();
		if (hidden) ui.auto.show();
		game.resume();
	});
};

let extensionPackage = {
	name: "活动萌扩",
	editable: false,
	content: content,
	precontent: precontent,
	config: config,
	help: help,
	files: {},
	//新人制作扩展，希望大家支持。
	//新人技术不足，希望大家包涵。
	//壹、贰、叁、肆、伍、陆、柒、捌、玖、拾
};

export let type = 'extension';
export default async function () {
	const { name, intro, ...otherInfo } = await lib.init.promises.json(`${lib.assetURL}extension/活动萌扩/info.json`);
	extensionPackage.package = {
		...otherInfo,
		intro: [
			'活动武将分离系列之一，旨在补充部分活动场，更新周期较慢',
			`当前拥有${lib.config.extension_活动萌扩_decade_Coin || 0}萌币`,
			'<a href="https://github.com/mengxinzxz/MengKuo-update">点击前往活动萌扩Github仓库</a>',
			'感谢大家对活动萌扩的支持！',
		].join('<br>'),
	};
	return extensionPackage;
};
