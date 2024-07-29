import { lib, game, ui, get, ai, _status } from '../../../noname.js'
export let config = {
	HDcheckNew: {
		name: '<span style="font-family: xingkai">点击查看更新公告</span>',
		clear: true,
		onclick: function () {
			try { game.bolShowNewPackx() }
			catch (e) { alert('打开更新公告时出问题了，请凭此截图找萌新转型中反馈此bug') }
		},
	},
	FenJieXianAA: {
		clear: true,
		name: '<li>新斗地主/超级斗地主 萌币特殊功能',
	},
	use_DDZname: {
		name: '超级斗地主启用特定将池<br>cost：一局500萌币',
		intro: '打开此选项后，超级斗地主模式改为下方编辑的特定将池（不编辑则默认为新服活动将池）',
		init: false,
		onclick: function (bool) {
			if (bool && lib.config.extension_活动萌扩_decade_Coin < 500 && lib.config.connect_nickname != '萌新（转型中）') {
				alert('很抱歉，您的萌币不足以使用超级斗地主特定将池');
				return;
			}
			game.saveConfig('extension_活动萌扩_use_DDZname', bool);
		},
	},
	decade_shanlian: {
		name: '闪连模式',
		intro: '打开此选项后，新服斗地主模式于开始时添加全局技能【闪连】（锁定技，当你得到【闪】后，你摸一张牌。）',
		init: false,
	},
	view_DDZname: {
		clear: true,
		name: '新斗地主默认将池一览',
		onclick: function () {
			alert(get.translation([
				'shen_zhaoyun', 'shen_ganning', 'liuyan', 'xizhicai', 're_wuyi', 'xin_lingtong', 'zhoushan', 'chengui',
				'dc_liuye', 'dc_tengfanglan', 'shen_machao', 'shen_zhangfei', 'shen_zhangjiao', 'shen_dengai', 're_liuzan', 'caojinyu',
				're_sunyi', 'caomao', 'xushao', 'zhujianping', 'tenggongzhu', 'zhangxuan', 'dc_zhouxuān', 'zerong',
				'dc_luotong', 'ruanji', 'dc_xujing', 'xuelingyun', 'yue_caiwenji', 'star_caoren'
			]));
		},
	},
	edit_DDZname: {
		name: '编辑新服斗地主专属将池<br>cost：2000萌币',
		clear: true,
		onclick: function () {
			if (lib.config.extension_活动萌扩_decade_Coin < 2000 && lib.config.connect_nickname != '萌新（转型中）') {
				alert('很遗憾，您的萌币不足以编辑超级斗地主特定将池');
				return;
			}
			game.saveConfig('extension_活动萌扩_decade_Coin', lib.config.extension_活动萌扩_decade_Coin - 2000);
			game.bolSay('编辑超级斗地主特定将池，已花费2000萌币');
			var container = ui.create.div('.popup-container.editor');
			var node = container;
			var map = lib.config.extension_活动萌扩_DDZname || [
				'shen_zhaoyun', 'shen_ganning', 'liuyan', 'xizhicai', 're_wuyi', 'xin_lingtong', 'zhoushan', 'chengui',
				'dc_liuye', 'dc_tengfanglan', 'shen_machao', 'shen_zhangfei', 'shen_zhangjiao', 'shen_dengai', 're_liuzan', 'caojinyu',
				're_sunyi', 'caomao', 'xushao', 'zhujianping', 'tenggongzhu', 'zhangxuan', 'dc_zhouxuān', 'zerong',
				'dc_luotong', 'ruanji', 'dc_xujing', 'xuelingyun', 'yue_caiwenji', 'star_caoren'
			];
			var str = '//编辑新服斗地主将池';
			str += '\nDDZname=[\n';
			for (var i = 0; i < map.length; i++) {
				str += '"' + map[i] + '",';
				if (i + 1 < map.length && (i + 1) % 5 == 0) str += '\n';
			}
			str += '\n];';
			node.code = str;
			ui.window.classList.add('shortcutpaused');
			ui.window.classList.add('systempaused');
			var saveInput = function () {
				var code;
				if (container.editor) code = container.editor.getValue();
				else if (container.textarea) code = container.textarea.value;
				try {
					var DDZname = null;
					eval(code);
					if (!Array.isArray(DDZname)) {
						throw ('err');
					}
				}
				catch (e) {
					var tip = lib.getErrorTip(e) || '';
					alert('代码语法有错误，请仔细检查（' + e + '）' + tip);
					window.focus();
					if (container.editor) container.editor.focus();
					else if (container.textarea) container.textarea.focus();
					return;
				}
				game.saveConfig('extension_活动萌扩_DDZname', DDZname);
				ui.window.classList.remove('shortcutpaused');
				ui.window.classList.remove('systempaused');
				container.delete();
				container.code = code;
				delete window.saveNonameInput;
			};
			window.saveNonameInput = saveInput;
			var editor = ui.create.editor(container, saveInput);
			if (node.aced) {
				ui.window.appendChild(node);
				node.editor.setValue(node.code, 1);
			}
			else if (lib.device == 'ios') {
				ui.window.appendChild(node);
				if (!node.textarea) {
					var textarea = document.createElement('textarea');
					editor.appendChild(textarea);
					node.textarea = textarea;
					lib.setScroll(textarea);
				}
				node.textarea.value = node.code;
			}
			else {
				if (!window.CodeMirror) {
					lib.init.js(lib.assetURL + 'game', 'codemirror', () => lib.codeMirrorReady(node, editor));
					lib.init.css(lib.assetURL + 'layout/default', 'codemirror');
				}
				else lib.codeMirrorReady(node, editor);
			}
		},
	},
	reset_DDZname: {
		name: '重置新服斗地主专属将池',
		clear: true,
		onclick: function () {
			if (confirm('是否重置已编辑的新服斗地主将池？')) {
				if (confirm('该操作不可撤销！是否确认重置？')) {
					game.saveConfig('extension_活动萌扩_DDZname', null);
					alert('自定义新服斗地主将池已重置');
				}
			}
		},
	},
	FenJieXianA: {
		clear: true,
		name: '<li>关于《龙舟会战》',
	},
	singleControl: {
		name: '单人控制',
		intro: '单人控制所有友方角色',
		init: false,
	},
	chooseGroup: {
		name: '选择势力',
		intro: '选择一个势力作为龙舟会战玩家方的势力',
		init: 'wei',
		item: {
			'wei': '魏国',
			'shu': '蜀国',
			'wu': '吴国',
			'qun': '群雄',
			'jin': '晋朝',
		},
	},
	getLevel: {
		name: '选择等阶',
		intro: '选择友方角色的等阶',
		init: '1',
		item: {
			'1': '一阶',
			'2': '二阶',
			'3': '三阶',
			'4': '四阶',
			'5': '五阶',
		},
	},
	JiaZhuAwaken: {
		name: '2023家族二段技能',
		intro: '在龙舟会战2023中拥有家族二段技能',
		init: false,
	},
	FenJieXianB: {
		clear: true,
		name: '<li>关于《山海志异》<br>目前模式：青丘弄琴，昆阳之战',
	},
	singleControlx: {
		name: '单人控制',
		intro: '于青丘弄琴模式单人控制所有友方角色',
		init: false,
	},
	levelSkills: {
		name: '技能池',
		intro: '更改游戏内获得的技能对应的武将的等阶范围',
		init: '0',
		item: {
			'0': '>=平凡',
			'1': '>=普通',
			'2': '>=稀有',
			'3': '>=史诗',
			'4': '>=传说',
		},
	},
	FenJieXianC: {
		clear: true,
		name: '<li>关于《龙舟争渡》',
	},
	singleControly: {
		name: '单人控制',
		intro: '单人控制所有友方角色',
		init: false,
	},
	FenJieXianD: {
		clear: true,
		name: '<li>关于《微信斗地主》',
	},
	chooseSex: {
		name: '选择性别',
		intro: '选择玩家性别',
		init: 'male',
		item: {
			'male': '♂',
			'female': '♀',
		},
	},
	FenJieXianE: {
		clear: true,
		name: '<li>关于《合纵抗秦》',
	},
	kangqin_lineName: {
		name: '竖直ID',
		intro: '抗秦模式玩家ID默认横向显示，开启此选项后玩家ID为竖直显示',
		init: false,
	},
	kangqin_player: {
		name: '玩家形象',
		intro: '选择玩家在抗秦模式中的登场形象',
		init: 'bol_unknown_male6',
		item: {
			bol_unknown_male6: '步兵(男)',
			bol_unknown_male1: '羽林内军(男)',
			bol_unknown_male2: '常山府军(男)',
			bol_unknown_male3: '江夏弓骑兵(男)',
			bol_unknown_male4: '太行山豪侠(男)',
			bol_unknown_male5: '武林山隐伏(男)',
			bol_unknown_female6: '佣兵(女)',
			bol_unknown_female1: '黑绸巫女(女)',
			bol_unknown_female2: '美人计(女)',
			bol_unknown_female3: '婆娑匠奴(女)',
			bol_unknown_female4: '武库清点(女)',
			bol_unknown_female5: '血婆娑巧手(女)',
		},
	},
	kangqin_group: {
		name: '玩家势力',
		intro: '选择玩家在抗秦模式中的登场势力',
		init: 'wei',
		get item() {
			if (!(lib.group || []).length) {
				return {
					wei: '魏',
					shu: '蜀',
					wu: '吴',
					qun: '群',
					jin: '晋',
				};
			}
			let map = {};
			lib.group.forEach(group => {
				if (group != 'daqin' && group != 'shen') {
					map[group] = get.translation(group);
				}
			})
			return map;
		},
	},
	kangqin_level: {
		name: '玩家等阶',
		intro: '设置玩家在抗秦模式中的等阶。<br><li>一阶：无特权。<br><li>二阶：游戏开始时随机使用一张装备牌，起始手牌+1。<br><li>三阶：体力上限和可选择技能的数量上限+1，出牌阶段可额外使用一张【杀】。<br><li>四阶：起始手牌在二阶基础上+1，摸牌阶段可多摸一张牌。<br><li>五阶:体力上限和可选择技能的数量在三阶基础上+1，且视为拥有技能〖涅槃〗。',
		init: '1',
		item: {
			'1': '一阶',
			'2': '二阶',
			'3': '三阶',
			'4': '四阶',
			'5': '五阶',
		},
	},
}