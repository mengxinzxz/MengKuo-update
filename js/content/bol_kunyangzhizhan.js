import { lib, game, ui, get, ai, _status } from '../../../../noname.js';

const brawl = {
    name: '昆阳之战',
    mode: 'identity',
    intro: [
        '游戏背景：公元23年（地皇四年，更始元年），昆阳之战，刘秀以一万绿林军击败王莽42万新军。昆阳大捷后，更始帝遣王匡攻洛阳，申屠建、李松急攻武关，三辅震动，各地豪强纷纷诛杀新朝牧守，用汉年号，服从更始政令。不久绿林军攻入长安，王莽被杀，新朝灭亡。',
        '游戏规则：玩家扮演刘秀（10血白板）与王莽（42血）和四名士兵（1血）对阵，击败王莽<span class=\'texiaotext\' style=\'color:#FF0000\'>（能做得到就试试吧）</span>或存活七轮即可获得游戏胜利',
        '游戏机制：' +
        '<br>刘秀于游戏开始时从随机三个技能中选择获得其中的一个技能，刘秀击败士兵后将获得1点信念，刘秀死亡时，若刘秀有信念标记，则刘秀失去1个信念标记并改为休整一轮（无信念时也可花费500萌币进行休整，一局游戏中最多花费三次萌币进行休整，且每次萌币支出须比上一次多花费500萌币），复活时摸七张牌，然后从随机三个技能中选择获得其中一个技能' +
        '<br>王莽的回合开始时，对刘秀进行嘲讽，刘秀失去3+X点体力（X为场上阵亡角色数）' +
        '<br>士兵死亡后，王莽和所有存活士兵各获得2点体力上限，回复2点体力，摸两张牌',
    ],
    init: function () {
        lib.configOL.number = 6;
        lib.config.mode_config.identity.double_character = false;
        lib.config.mode_config.identity.auto_mark_identity = false;
        lib.config.levelSkills = lib.config.extension_活动萌扩_levelSkills;
        var pack = {
            character: {
                gw_liuxiu: ['male', 'qun', 10, [], ['ext:活动萌扩/image/gw_liuxiu.jpg']],
                gw_wangmang: ['male', 'qun', 42, ['mashu', 'gw_jianqu'], ['ext:活动萌扩/image/gw_wangmang.jpg']],
                gw_shibing: ['male', 'qun', 1, ['mashu'], ['ext:活动萌扩/image/gw_shibing.jpg']],
            },
            characterIntro: {
                gw_liuxiu: '刘秀（前5年1月13日～57年3月29日），字文叔。南阳郡蔡阳县（今湖北省枣阳市）人，汉高祖刘邦九世孙。中国东汉王朝的开国皇帝（25年8月5日～57年3月29日在位），中国古代军事家、政治家。刘秀早年入太学学习。王莽末年，赤眉、绿林起义先后爆发。22年，刘秀与其兄刘縯抱着恢复刘姓统治的目的，起兵于舂陵。次年二月绿林军建立更始政权后，刘縯任大司徒，刘秀任太常、偏将军。23年六月，新莽大军围绿林军于昆阳。刘秀突围调集援兵，与留守城内的义军合击，重创莽军。刘秀在昆阳之战中立了大功之后，逐渐与农民军分庭抗礼。后被封为萧王，河北地区的豪强地主先后归附，刘秀羽翼已丰，遂拒绝听从更始政权的调动。同年秋，大败和收编河北地区的铜马等地的农民起义军，扩充实力，故有“铜马帝”之称。25年六月，正式称帝于鄗，重建汉政权，定都洛阳，史称东汉。27年，农民起义军全被刘秀消灭。35年，先后削平青州张步、渔阳彭宠、天水隗嚣、益州公孙述等豪强割据武装，恢复了中国的统一。57年二月，刘秀驾崩，享年六十三岁，谥号光武，庙号世祖，安葬于原陵。刘秀即位后，致力于整顿吏治，加强专制主义中央集权，改革监察制度，提高刺举之吏的权限和地位。刘秀还采取不少措施来安定民生，恢复残破的社会经济。建武六年（30年）下诏恢复三十税一的旧制，并且罢郡国都尉官，停止地方兵的都试，一度废除更役制度。刘秀居安思危，勤于政务，自奉节俭，与开创“光武中兴”的局面有着直接关系。',
                gw_wangmang: '王莽（前45年-23年），字巨君，魏郡元城(今河北大名东)人，汉元帝皇后王政君之侄，西汉新都侯王曼之子，中国西汉改革家、政治家、新朝皇帝。王莽早年折节恭俭，勤奋博学，孝事老母，以德行著称。阳朔中为黄门郎，迁射声校尉，永始初封新都侯，迁骑都尉，光禄大夫，侍中。绥和初代王根为大司马，迎哀帝即位，罢遣就国。哀帝时，王莽被迫告退，闭门自守。元后临朝称制后，以王莽为辅政大臣，出任大司马，封“安汉公”。王莽总揽朝政，遂诛灭异己，广植党羽，以此获得了许多人的拥护。孺子婴为帝时，王莽以摄政名义据天子之位，9年，废孺子婴，篡位称帝，改国号为新，建年号为“始建国”。进行了托古改制，下令变法。王莽将全国土地改为“王田”，限制个人占有数量；奴婢改称“私属”，均禁止买卖；各家超出土地规定的，要把地分给九族或邻里；无田的人家按照一夫百亩的标准受田；违抗不遵者流放远裔。次年，王莽又下诏推行五均六筦，以控制和垄断工商业，增加国家税收，并由国家经营盐、铁、酒、铸钱、五均赊贷等五业，不许私人经营。恢复五等爵，经常改变官制和行政区划等。23年，王莽在绿林军攻入长安时被杀，在位15年，死时69岁。王莽一直是一位备受争议的人物。古代史学家以“正统”的观念，认为其是篡位的“巨奸”，但近代却被很多史学家誉为“中国历史上第一位社会改革家”。二十四史之一的《汉书》把王莽列作“逆臣”一类，近代学者胡适则评价王莽为“中国第一位社会主义者。” ',
            },
            skill: {
                //刘秀机制
                _gw_xinnian: {
                    charlotte: true,
                    superCharlotte: true,
                    ruleSkill: true,
                    trigger: { global: 'phaseBefore' },
                    filter: function (event, player) {
                        return game.phaseNumber == 0 && player.identity == 'cai';
                    },
                    direct: true,
                    content: function () {
                        'step 0'
                        var skills = game.gwSkills.filter(skill => !player.hasSkill(skill)).randomGets(3);
                        if (!skills.length) { event.finish(); return; }
                        var getSkillDialog = function (skills, prompt) {
                            var dialog = ui.create.dialog('hidden', 'forcebutton');
                            if (prompt) dialog.addText(prompt);
                            for (var i = 0; i < skills.length; i++) {
                                dialog.add('<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【' + get.translation(skills[i]) + '】</div><div>' + lib.translate[skills[i] + '_info'] + '</div></div>');
                            }
                            dialog.addText(' <br> ');
                            return dialog;
                        };
                        var dialog = getSkillDialog(skills, '选择获得一个技能');
                        player.chooseControl(skills).set('dialog', dialog);
                        'step 1'
                        if (result.control) player.addSkillLog(result.control);
                    },
                    intro: { content: 'mark' },
                },
                _gw_die: {
                    charlotte: true,
                    superCharlotte: true,
                    ruleSkill: true,
                    trigger: { player: 'dieBefore' },
                    filter: function (event, player) {
                        return (player.hasMark('_gw_xinnian') || (_status.reviveLength < 3 && lib.config.extension_活动萌扩_decade_Coin >= 500 * _status.reviveLength)) && player.identity == 'cai';
                    },
                    direct: true,
                    priority: 15,
                    content: function () {
                        'step 0'
                        if (player.hasMark('_gw_xinnian')) {
                            player.removeMark('_gw_xinnian', 1);
                            event._result = { bool: true, cost: true };
                        }
                        else player.chooseBool().set('prompt', '糟糕！没有信念了！').set('prompt2', '是否花费' + (500 * (_status.reviveLength)) + '萌币进入休整？（当前萌币：' + lib.config.extension_活动萌扩_decade_Coin + '）').set('choice', false);
                        'step 1'
                        if (result.bool) {
                            if (!result.cost) {
                                var num = 500 * _status.reviveLength;
                                game.bolSay('购买额外重整次数花费' + num + '萌币');
                                game.saveConfig('extension_活动萌扩_decade_Coin', lib.config.extension_活动萌扩_decade_Coin - num);
                                _status.reviveLength++;
                            }
                            if (_status.gw_xinnian_return && _status.gw_xinnian_return[player.playerid]) trigger.cancel();
                            else {
                                trigger.setContent(lib.skill._gw_die.dieContent);
                                trigger.includeOut = true;
                            }
                        }
                    },
                    dieContent: function () {
                        'step 0'
                        event.forceDie = true;
                        if (source) {
                            game.log(player, '被', source, '杀害');
                            if (!source.stat[source.stat.length - 1].kill) source.stat[source.stat.length - 1].kill = 1;
                            else source.stat[source.stat.length - 1].kill++;
                        }
                        else game.log(player, '阵亡');
                        if (player.isIn() && (!_status.gw_xinnian_return || !_status.gw_xinnian_return[player.playerid])) {
                            event.reserveOut = true;
                            game.log(player, '进入了修整状态');
                            game.log(player, '移出了游戏');
                            if (!_status.gw_xinnian_return) _status.gw_xinnian_return = {};
                            _status.gw_xinnian_return[player.playerid] = 1;
                        }
                        else event.finish();
                        if (!game.countPlayer()) game.over();
                        else if (player.hp != 0) player.changeHp(0 - player.hp, false).forceDie = true;
                        game.broadcastAll(function (player) {
                            if (player.isLinked()) player.classList.toggle('linked' + (get.is.linked2(player) ? '2' : ''));
                            if (player.isTurnedOver()) player.classList.toggle('turnedover');
                        }, player);
                        game.addVideo('link', player, player.isLinked());
                        game.addVideo('turnOver', player, player.classList.contains('turnedover'));
                        'step 1'
                        event.trigger('die');
                        'step 2'
                        if (event.reserveOut) {
                            player.removeSkill(player.tempSkills);
                            player.removeSkill(player.getSkills().filter(skill => get.info(skill) && get.info(skill).temp));
                            event.cards = player.getCards('hejsx');
                            if (event.cards.length) player.discard(event.cards).forceDie = true;
                        }
                        'step 3'
                        if (event.reserveOut) game.broadcastAll(player => player.classList.add('out'), player);
                        if (source && lib.config.border_style == 'auto' && (lib.config.autoborder_count == 'kill' || lib.config.autoborder_count == 'mix')) {
                            switch (source.node.framebg.dataset.auto) {
                                case 'gold': case 'silver': source.node.framebg.dataset.auto = 'gold'; break;
                                case 'bronze': source.node.framebg.dataset.auto = 'silver'; break;
                                default: source.node.framebg.dataset.auto = lib.config.autoborder_start || 'bronze';
                            }
                            if (lib.config.autoborder_count == 'kill') source.node.framebg.dataset.decoration = source.node.framebg.dataset.auto;
                            else {
                                var dnum = 0;
                                for (var j = 0; j < source.stat.length; j++) {
                                    if (source.stat[j].damage) dnum += source.stat[j].damage;
                                }
                                source.node.framebg.dataset.decoration = '';
                                switch (source.node.framebg.dataset.auto) {
                                    case 'bronze': if (dnum >= 4) source.node.framebg.dataset.decoration = 'bronze'; break;
                                    case 'silver': if (dnum >= 8) source.node.framebg.dataset.decoration = 'silver'; break;
                                    case 'gold': if (dnum >= 12) source.node.framebg.dataset.decoration = 'gold'; break;
                                }
                            }
                            source.classList.add('topcount');
                        }
                    },
                },
                _gw_return: {
                    charlotte: true,
                    superCharlotte: true,
                    ruleSkill: true,
                    trigger: { player: 'phaseBefore' },
                    filter: function (event, player) {
                        return !event._gw_xinnian_return && event.player.isOut() && _status.gw_xinnian_return[event.player.playerid];
                    },
                    direct: true,
                    forceDie: true,
                    forceOut: true,
                    content: function () {
                        'step 0'
                        _status.gw_xinnian_return[trigger.player.playerid]--;
                        if (_status.gw_xinnian_return[trigger.player.playerid]) event.finish();
                        'step 1'
                        trigger._gw_xinnian_return = true;
                        game.broadcastAll(player => player.classList.remove('out'), trigger.player);
                        game.log(trigger.player, '移回了游戏');
                        player.recover(trigger.player.maxHp - trigger.player.hp);
                        'step 2'
                        event.trigger('restEnd');
                    }
                },
                _gw_back: {
                    charlotte: true,
                    superCharlotte: true,
                    ruleSkill: true,
                    trigger: { global: 'restEnd' },
                    filter: function (event, player) {
                        return event.getTrigger().player == player;
                    },
                    direct: true,
                    content: function () {
                        'step 0'
                        player.draw(7);
                        'step 1'
                        var next = game.createEvent('_gw_xinnian');
                        next.player = player;
                        next.setContent(lib.skill._gw_xinnian.content);
                    },
                },
                _gw_win: {
                    charlotte: true,
                    superCharlotte: true,
                    ruleSkill: true,
                    trigger: { global: 'roundStart' },
                    filter: function (event, player) {
                        return game.roundNumber > 7 && player.identity == 'cai';
                    },
                    direct: true,
                    forceDie: true,
                    forceOut: true,
                    content: function () {
                        'step 0'
                        var targets = game.filterPlayer(target => target != player);
                        if (targets.length) targets.forEach(target => player.throwEmotion(target, 'egg'));
                        player.$fullscreenpop('复兴大汉', 'fire');
                        'step 1'
                        game.delay();
                        'step 2'
                        game.over(game.me.identity == 'cai');
                    },
                },
                //王莽机制
                _gw_chaofeng: {
                    charlotte: true,
                    superCharlotte: true,
                    ruleSkill: true,
                    trigger: { player: 'phaseBegin' },
                    filter: function (event, player) {
                        return game.zhu.isIn() && player.identity == 'zhu';
                    },
                    forced: true,
                    logTarget: () => game.zhu,
                    content: function () {
                        var num = player.getAllHistory('useSkill', evt => evt.skill == '_gw_chaofeng').length;
                        game.broadcastAll(function (num) {
                            if (lib.config.background_speak) game.playAudio('..', 'extension', '活动萌扩/audio', 'gw_chaofeng' + parseFloat(num));
                        }, num);
                        player.chat(lib.skill._gw_chaofeng.list[num - 1]);
                        game.zhu.loseHp(3 + game.dead.length);
                    },
                    list: [
                        '朕乃天下共主，竖子何衅君威？',
                        '农时不植菽麦，何以操持兵戈？',
                        '新朝以孝治世，何唯汝化为异类？',
                        '朕在阙一日，尔等终为臣子！',
                        '汝若屈膝称臣，朕许汝永为藩辅！',
                        '汝今为贼，师出无名，实为蠢物！',
                        '灭君废主之徒，终难逃朕之诛戮！',
                    ],
                },
                //王莽
                gw_jianqu: {
                    trigger: { player: ['damageBegin4', 'dying'] },
                    filter: function (event, player) {
                        return event.name == 'damage' || player.hp < 0;
                    },
                    forced: true,
                    content: function () {
                        if (trigger.name == 'dying') player.recover(1 - player.hp);
                        else trigger.num--;
                    },
                    ai: {
                        effect: {
                            target: function (card, player, target) {
                                if (player.hasSkillTag('jueqing', false, target)) return;
                                if (!get.tag(card, 'damage') || get.tag(card, 'damage') <= 1) return 'zerotarget';
                            },
                        },
                    },
                },
            },
            translate: {
                gw_liuxiu: '刘秀',
                gw_wangmang: '王莽',
                gw_shibing: '新军士兵',
                _gw_xinnian: '信念',
                _gw_die: '信念',
                _gw_return: '信念',
                _gw_back: '信念',
                _gw_win: '信念',
                _gw_chaofeng: '嘲弄',
                gw_jianqu: '坚躯',
                gw_jianqu_info: '锁定技。①你受到的伤害-1。②当你进入濒死状态时，你将体力回复至1点。',
            },
        };
        game.bolLoadPack(pack);
    },
    content: {
        submode: 'normal',
        chooseCharacterBefore: function () {
            //身份翻译
            lib.translate.cai = '盟';
            lib.translate.cai2 = '刘秀';
            lib.translate.zhong = '兵';
            lib.translate.zhong2 = '士兵';
            //位置分配
            game.players.sortBySeat(game.me);
            var targets = game.players.sortBySeat(game.me);
            game.zhu = game.me;
            targets.forEach(i => {
                if (i == game.me) i.identity = 'cai';
                else if (targets[3] == i) i.identity = 'zhu';
                else i.identity = 'zhong';
                i.showIdentity();
                i.identityShown = true;
            });
            //阵亡修改
            game.bilibili_gw = {
                getFriends: function (func) {
                    var self = false;
                    var player = this;
                    if (func === true) {
                        func = null;
                        self = true;
                    }
                    return game.filterPlayer(function (current) {
                        if (!self && current == player) return false;
                        return get.rawAttitude(player, current) > 0;
                    });
                },
                isFriendOf: function (player) {
                    return this.getFriends(true).includes(player);
                },
                getEnemies: function (func) {
                    var player = this, identity = player.identity;
                    return game.filterPlayer(function (current) {
                        return get.rawAttitude(player, current) < 0;
                    });
                },
                isEnemyOf: function (player) {
                    return this.getEnemies(true).includes(player);
                },
                dieAfter: function () {
                    var that = this;
                    if (that.identity == 'zhu') target.chat('我焯，挂');
                    if (that.identity != 'zhong') game.checkResult();
                },
                dieAfter2: function (source) {
                    var that = this;
                    if (that.identity == 'zhong') {
                        if (source && source.identity == 'cai') source.addMark('_gw_xinnian', 1);
                        var targets = game.filterPlayer(target => {
                            if (target == that) return false;
                            return target.identity == 'zhu' || target.identity == 'zhong';
                        });
                        targets.forEach(target => {
                            target.gainMaxHp(2);
                            target.recover(2);
                            target.draw(2);
                        });
                    }
                },
            };
            for (var i in game.bilibili_gw) lib.element.player[i] = game.bilibili_gw[i];
            for (var i of game.players) {
                for (var j in game.bilibili_gw) i[j] = game.bilibili_gw[j];
            }
            game.checkResult = function () {
                if (game.me.identity == 'zhong') game.over(game.players.some(target => target.identity == 'zhu'));
                else game.over(game.me.isAlive());
            };
            game.gwSkills = [];
            game.showIdentity(true);
            //初始化将池
            if (!_status.characterlist) lib.skill.pingjian.initList();
            _status.characterlist = _status.characterlist.filter(i => !i.startsWith('gw_'));
            for (var name of _status.characterlist) {
                var skills = lib.character[name][3];
                var getNum = function (name) {
                    var num;
                    switch (game.getRarity(name)) {
                        case 'junk': num = 0; break;
                        case 'rare': num = 2; break;
                        case 'epic': num = 3; break;
                        case 'legend': num = 4; break;
                        default: num = 1; break;
                    }
                    return num;
                };
                if (skills.length && getNum(name) >= lib.config.levelSkills) {
                    for (var i of skills) {
                        if (['huashen', 'rehuashen', 'xinsheng', 'rexinsheng', 'duanchang', 'pingjian', 'xinfu_pdgyingshi', 'dunshi', 'mbdanggu', 'mbmowang', 'olzaowang'].includes(i)) continue;
                        var info = get.info(i);
                        if (!info || info.charlotte || (info.unique && !info.gainable) || info.combo || info.juexingji || info.limited || info.zhuSkill || info.hiddenSkill || info.dutySkill) continue;
                        game.gwSkills.add(i);
                    }
                }
            }
            _status.reviveLength = 1;
            get.attitude = function (from, to) {
                return (from.identity == 'zhu' || from.identity == 'zhong') == (to.identity == 'zhu' || to.identity == 'zhong') ? 10 : -10;
            };
            get.rawAttitude = function (from, to) {
                return (from.identity == 'zhu' || from.identity == 'zhong') == (to.identity == 'zhu' || to.identity == 'zhong') ? 10 : -10;
            };
            game.showIdentity(true);
            game.chooseCharacter = function () {
                var next = game.createEvent('chooseCharacter', false);
                next.showConfig = true;
                next.setContent(function () {
                    'step 0'
                    ui.arena.classList.add('choose-character');
                    'step 1'
                    var map = { cai: 'gw_liuxiu', zhu: 'gw_wangmang', zhong: 'gw_shibing' };
                    game.players.forEach(i => i.init(map[i.identity]));
                    'step 2'
                    game.me.chooseControl('ok').set('prompt', '###游戏目标###击败王莽<span class=\'texiaotext\' style=\'color:#FF0000\'>（能做得到就试试吧）</span>，或在王莽的攻势下存活七轮');
                    'step 3'
                    setTimeout(() => ui.arena.classList.remove('choose-character'), 500);
                });
            };
        },
    },
};

export default brawl;