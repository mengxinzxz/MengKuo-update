import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const brawl = {
    name: '龙舟会战',
    mode: 'identity',
    intro: [
        '本模式为复刻OL龙舟会战2023年版本，单将模式，禁用手气卡',
        '模式规则：本模式共分两关' +
        '<br>敌人数目：2/6（不同势力之间均为敌对关系，但会优先攻击玩家方）' +
        '<br>敌人初始等阶：第一关随机3，4阶，第二关随机3，4，5阶' +
        '<br>胜利条件：玩家阵营获得两场战斗的游戏胜利' +
        '<br>失败条件：玩家阵营在任意战斗中全部阵亡',
        '牌堆替换：【酒】替换为【雄黄酒】，【五谷丰登】和【桃园结义】替换为【力争上游】，【无中生有】替换为【同舟共济】，【南蛮入侵】和【万箭齐发】替换为【逆水行舟】。',
        '关于选将：' +
        '<br>选将框中会随机挑选五张势力相同的武将牌供玩家选择，选将势力可在扩展页面自由选择' +
        '<br>此模式中神武将的势力和玩家选择的势力相同',
        '武将等阶特权（等阶可在扩展页面自由选择）：' +
        '<br>一阶：无特权' +
        '<br>二阶：初始手牌数+1' +
        '<br>三阶：初始手牌数+1，初始体力/体力上限+1，使用【杀】的额定次数+1' +
        '<br>四阶：初始手牌数+2，初始体力/体力上限+1，使用【杀】的额定次数+1' +
        '<br>五阶：初始手牌数+2，初始体力/体力上限+2，使用【杀】的额定次数+1，获得技能【重生】（仅玩家方获得，重生：限定技，当你处于濒死状态时，你可以弃置判定区内的所有牌，然后复原你的武将牌，摸五张牌，将体力回复至体力上限（至多为5））',
        '本模式中所有武将都拥有特殊的家族技能：' +
        '<br>魏·魏业：回合开始时，你可以弃置一张牌并指定一名敌方角色，该角色须弃置一张牌，否则你摸一张牌。' +
        '<br>蜀·蜀义：出牌阶段结束时，若你于此阶段使用【杀】次数不少于2，摸一张牌。' +
        '<br>吴·吴耀：回合结束时，若你的手牌数不等于你的体力值，则你摸一张牌。' +
        '<br>群·群心：锁定技，弃牌阶段开始时，若你的手牌数比体力值多2或更多，你本回合手牌上限+1；若你已损失体力值大于1，你手牌上限+1' +
        '<br>晋·晋势：回合开始时，你可以弃置一张牌，从牌堆中随机获得一张与此牌花色相同的牌。',
        '队友死亡后，会激活势力专属城池技能：' +
        '<br>魏·许昌：锁定技，当你受到伤害后，你摸一张牌。' +
        '<br>蜀·成都：锁定技，当你使用【杀】造成伤害后，你摸一张牌。' +
        '<br>吴·武昌：锁定技，当你使用装备牌时，你摸一张牌。' +
        '<br>群·邺城：锁定技，当你使用锦囊牌指定其他角色为目标后，你摸一张牌。' +
        '<br>晋·洛阳：锁定技，结束阶段，若你手牌中的花色数小于3，则你摸一张牌。',
        '击杀奖惩：击杀不同势力的角色和队友各摸一张牌；击杀队友的角色弃置所有牌。',
        '禁用所有换位技能',
        '2023年龙舟会战新机制：粽子' +
        '<br>①所有角色于游戏开始时获得2个“粽”标记，玩家方随机使用一张装备牌，所有角色每造成1点伤害获得1个“棕”标记，击杀其他角色可获得该角色的所有“棕”标记' +
        '<br>②每一整局龙舟会战会随机进行一个有关“棕”标记的全局效果' +
        '<br>·大快朵颐：使用锦囊牌时失去2个“棕”标记，摸一张牌。' +
        '<br>·五味俱全：造成伤害时失去4个“棕”标记，令此伤害+1。' +
        '<br>·回味无穷：使用【杀】造成伤害后失去2个“棕”标记，摸一张牌。' +
        '<br>·珠翠之珍：使用装备牌时失去1个“棕”标记，摸一张牌。' +
        '<br>·津津有味：使用【桃】回复体力后失去4个“棕”标记，回复1点体力。' +
        '<br>·珍馐美馔：摸牌阶段开始时失去所有“棕”标记，摸X张牌（X为移去的“棕”标记数的一半，向下取整）。' +
        '<br>·垂涎欲滴：结束阶段失去所有“棕”标记，摸X张牌（X为移去的“棕”标记数的一半，向下取整）。' +
        '<br>·酒足饭饱：①若你的“棕”标记数：不小于2，摸牌阶段多摸一张牌；不小于4，使用牌无距离限制；不小于6，使用【杀】的额定次数+1。②结束阶段，你失去X个“棕”标记（X为你的“棕”标记数，向下取整）',
    ],
    init() {
        if (!_status.characterlist) lib.skill.pingjian.initList();
        for (let i in lib.skill) {
            let skill = lib.skill[i].inherit || i;
            if (lib.skill[skill].seatRelated === 'changeSeat') {
                lib.skill[i] = {};
                if (lib.translate[i + '_info']) lib.translate[i + '_info'] = '此模式下不可用';
                if (lib.translate[i + '_info_identity']) lib.translate[i + '_info_identity'] = '此模式下不可用';
                if (lib.translate[i + '_info_identity_normal']) lib.translate[i + '_info_identity_normal'] = '此模式下不可用';
                if (lib.dynamicTranslate[i]) lib.dynamicTranslate[i] = () => '此模式下不可用';
            }
        }
        lib.configOL.number = 4;
        lib.config.extension_活动萌扩_chooseGroup ??= 'wei';
        lib.config.extension_活动萌扩_getLevel ??= '1';
        lib.config.mode_config.identity.change_card = 'disabled';
        lib.config.mode_config.identity.double_character = false;
        lib.config.singleControl = lib.config.extension_活动萌扩_singleControl;
        if (lib.config.singleControl) lib.config.mode_config.identity.dierestart = false;
    },
    content: {
        submode: 'normal',
        //牌堆替换
        cardPile() {
            for (var i = 0; i < lib.card.list.length; i++) {
                switch (lib.card.list[i][2]) {
                    case 'jiu': lib.card.list[i][2] = 'xionghuangjiu'; break;
                    case 'wuzhong': lib.card.list[i][2] = 'tongzhougongji'; break;
                    case 'wugu': case 'taoyuan': lib.card.list[i][2] = 'lizhengshangyou'; break;
                    case 'nanman': case 'wanjian': lib.card.list[i][2] = 'nishuixingzhou'; break;
                    case 'bingliang': case 'lebu': case 'shandian': lib.card.list.splice(i--, 1); break;
                }
            }
            return lib.card.list;
        },
        //更改游戏配置
        chooseCharacterBefore() {
            //修改函数
            _status.mode = 'normal';
            const changeFunction = {
                get: {
                    //设置态度值
                    rawAttitude(from, to) {
                        if (!from || !to) return 0;
                        var identity = game.me.identity;
                        if (from.identity == to.identity) return 10;
                        if (from != to && (from.identity == identity || to.identity == identity)) return -10;
                        return -7.5;
                    },
                },
                game: {
                    //初始手牌数
                    gameDraw(player) {
                        const next = game.createEvent("gameDraw", true, _status.event?.getParent("phaseLoop", true));
                        next.player = player || game.me;
                        next.num = function (player) {
                            if (game.RElongzhou && player.identity === game.me.identity) return 2;
                            const num = Number(player.lz_levelNum || '1');
                            return (game.RElongzhou ? 5 : 4) + (num > 1) + (num > 3);
                        };
                        next.setContent("gameDraw");
                        return next;
                    },
                    //死亡检查胜负情况
                    checkResult() {
                        if (!get.population(game.me.identity)) game.over(false);
                        else {
                            const fellow = game.me.fellow;
                            if (!ui.giveupSystem && (!game.players.includes(fellow) || lib.config.singleControl)) {
                                ui.giveupSystem = ui.create.system('投降', function () {
                                    game.log(game.me, '投降');
                                    game.over(false);
                                }, true);
                            }
                            var list = [];
                            for (var i of game.players) if (!list.includes(i.identity)) list.push(i.identity);
                            if (list.length == 1) {
                                if (game.RElongzhou) game.over(true);
                                else {
                                    game.RElongzhou = true;
                                    ui.arena.setNumber(8);
                                    var groupList = ['wei', 'shu', 'wu', 'qun', 'jin'].remove(game.me.identity);
                                    groupList = groupList.randomGets(3);
                                    groupList.randomSort();
                                    var tempNum = 3;
                                    if (fellow && game.me.getSeatNum() > fellow.getSeatNum()) fellow.dataset.position = 7;
                                    while (game.dead.some(target => target.identity !== game.me.identity)) {
                                        var target = game.dead.find(target => target.identity !== game.me.identity);
                                        if (target) {
                                            target.revive(null, false);
                                            if (target.node.dieidentity) {
                                                target.node.dieidentity.innerHTML = '';
                                                delete target.node.dieidentity;
                                            }
                                            target.uninit();
                                            target.identity = groupList[0];
                                            target.setIdentity();
                                            target.identityShown = true;
                                            var listxx = [];
                                            for (var name of _status.characterlist) {
                                                if (lib.character[name][1] == target.identity) listxx.push(name);
                                            }
                                            target.init(listxx.randomGet());
                                            if (target.countCards('hejsx')) {
                                                var hs = target.getCards('hejsx')
                                                for (var i = 0; i < hs.length; i++) {
                                                    hs[i].discard(false);
                                                }
                                            }
                                            target.dataset.position = tempNum - game.me.getSeatNum();
                                            tempNum++;
                                            target.removeMark('_lz_zong_mark', target.countMark('_lz_zong_mark'), false);
                                            target.addMark('_lz_zong_mark', 2);
                                            target.setLevel(get.rand(3, 5).toString());
                                            switch (target.lz_levelNum) {
                                                case '3':
                                                    target.maxHp = target.maxHp + 1;
                                                    target.hp = target.hp + 1;
                                                    target.update();
                                                    break;
                                                case '4':
                                                    target.maxHp = target.maxHp + 1;
                                                    target.hp = target.hp + 1;
                                                    target.update();
                                                    break;
                                                case '5':
                                                    target.maxHp = target.maxHp + 2;
                                                    target.hp = target.hp + 2;
                                                    target.update();
                                                    break;
                                            }
                                        }
                                        else break;
                                    }
                                    for (var num = 1; num <= 4; num++) {
                                        var listx = [], identityxx = groupList[num <= 2 ? 1 : 2];
                                        for (var name of _status.characterlist) {
                                            if (lib.character[name][1] == identityxx) listx.push(name);
                                        }
                                        var target = game.addFellow(tempNum - game.me.getSeatNum(), listx.randomGet());
                                        target.identity = identityxx;
                                        target.setIdentity();
                                        target.identityShown = true;
                                        tempNum++;
                                        target.removeMark('_lz_zong_mark', target.countMark('_lz_zong_mark'), false);
                                        target.addMark('_lz_zong_mark', 2);
                                        target.setLevel(get.rand(3, 5).toString());
                                        switch (target.lz_levelNum) {
                                            case '3':
                                                target.maxHp = target.maxHp + 1;
                                                target.hp = target.hp + 1;
                                                target.update();
                                                break;
                                            case '4':
                                                target.maxHp = target.maxHp + 1;
                                                target.hp = target.hp + 1;
                                                target.update();
                                                break;
                                            case '5':
                                                target.maxHp = target.maxHp + 2;
                                                target.hp = target.hp + 2;
                                                target.update();
                                                break;
                                        }
                                    }
                                    //分配座位号
                                    var current;
                                    if (game.me.isAlive()) current = ((fellow && game.me.next == fellow) ? game.me.next.next : game.me.next);
                                    else current = fellow.next;
                                    while (![game.me, fellow].includes(current)) {
                                        current.setSeatNum(current.previous.getSeatNum() + 1);
                                        if (!current.node.seat) current.setNickname(get.cnNumber(current.seatNum, true) + '号位');
                                        current = current.next;
                                    }
                                    //新的开始
                                    let cards = Array.from(ui.ordering.childNodes);
                                    if (cards.length > 0) {
                                        while (cards.length) {
                                            cards.shift().discard();
                                        }
                                    }
                                    game.resetSkills();
                                    _status.paused = false;
                                    let evt = _status.event.getParent("phaseLoop", true);
                                    if (evt) {
                                        let evtx = _status.event;
                                        while (evtx !== evt) {
                                            evtx.finish();
                                            evtx.untrigger(true);
                                            evtx = evtx.getParent();
                                        }
                                        evtx.player = _status.firstAct2.previous;
                                        evtx.step = 0;
                                    }
                                    _status.roundStart = _status.firstAct2;
                                    game.phaseNumber = 0;
                                    game.roundNumber = 0;
                                    game.updateRoundNumber();
                                    game.gameDraw();
                                }
                            }
                        }
                    },
                    //选将
                    chooseCharacter() {
                        //神武将势力变更
                        if (!_status.characterlist) lib.skill.pingjian.initList();
                        _status.characterlist = _status.characterlist.filter(name => {
                            const info = get.character(name);
                            return !info.doubleGroup.length;
                        });
                        for (const name in lib.character) {
                            if (get.character(name).group === 'shen') lib.character[name][1] = game.me.identity;
                        }
                        //第一轮敌人初始化
                        for (var i of game.players) {
                            if (i.identity != game.me.identity) {
                                i.init(_status.characterlist.filter(name => get.character(name).group === i.identity).randomRemove());
                                i.addMark('_lz_zong_mark', 2);
                                i.setLevel(get.rand(3, 4).toString());
                                switch (i.lz_levelNum) {
                                    case '3':
                                        i.maxHp = i.maxHp + 1;
                                        i.hp = i.hp + 1;
                                        i.update();
                                        break;
                                    case '4':
                                        i.maxHp = i.maxHp + 1;
                                        i.hp = i.hp + 1;
                                        i.update();
                                        break;
                                }
                            }
                        }
                        const next = game.createEvent('chooseCharacter', false);
                        next.showConfig = true;
                        next.player = game.me;
                        next.setContent(async function (event, trigger, player) {
                            const evt = ['lz_dakuaiduoyi', 'lz_wuweijuquan', 'lz_huiweuwuqiong', 'lz_zhucuizhizhen', 'lz_jinjinyouwei', 'lz_zhenxiumeizhuan', 'lz_chuixianyudi', 'lz_jiuzufanbao'].randomGet();
                            game.addGlobalSkill(evt);
                            game.broadcastAll(function (evt) {
                                if (get.is.phoneLayout()) ui.guanduInfoxx = ui.create.div('.touchinfo.left', ui.window);
                                else ui.guanduInfoxx = ui.create.div(ui.gameinfo);
                                ui.guanduInfoxx.innerHTML = '本局事件：' + get.translation(evt);
                            }, evt);
                            const evtlist = [
                                '使用锦囊牌时失去2个“棕”标记，摸一张牌。',
                                '造成伤害时失去4个“棕”标记，令此伤害+1。',
                                '使用【杀】造成伤害后失去2个“棕”标记，摸一张牌。',
                                '使用装备牌时失去1个“棕”标记，摸一张牌。',
                                '使用【桃】回复体力后失去4个“棕”标记，回复1点体力。',
                                '摸牌阶段开始时失去所有“棕”标记，摸X张牌（X为移去的“棕”标记数的一半，向下取整）。',
                                '结束阶段失去所有“棕”标记，摸X张牌（X为移去的“棕”标记数的一半，向下取整）。',
                                '①若你的“棕”标记数：不小于2，摸牌阶段多摸一张牌；不小于4，使用牌无距离限制；不小于6，使用【杀】的额定次数+1。②结束阶段，你失去X个“棕”标记（X为你的“棕”标记数，向下取整）',
                            ];
                            await player.chooseControl('ok').set('prompt', '###本局特殊事件：' + get.translation(evt) + '###' + evtlist[['lz_dakuaiduoyi', 'lz_wuweijuquan', 'lz_huiweuwuqiong', 'lz_zhucuizhizhen', 'lz_jinjinyouwei', 'lz_zhenxiumeizhuan', 'lz_chuixianyudi', 'lz_jiuzufanbao'].indexOf(evt)]);
                            ui.arena.classList.add('choose-character');
                            //玩家方选将
                            let list = [], aiList = [];
                            list = _status.characterlist.filter(name => get.character(name).group === player.identity).randomGets(10);
                            if (!lib.config.singleControl) aiList.addArray(list.randomRemove(5));
                            const createDialog = event.dialog = [lib.config.singleControl ? '请选择你和队友的武将' : '请选择你的武将'];
                            if (!lib.config.singleControl) createDialog.add('<div class="text center">玩家武将</div>');
                            createDialog.add([list, 'character']);
                            const fellow = game.players.find(current => current != player && current.identity == player.identity);
                            if (fellow) {
                                fellow.fellow = player;
                                player.fellow = fellow;
                                if (lib.config.singleControl) {
                                    game.addGlobalSkill('autoswap');
                                    fellow._trueMe = player;
                                }
                                else {
                                    createDialog.push('<div class="text center">队友武将</div>');
                                    createDialog.push([aiList, 'character']);
                                }
                            }
                            if (lib.onfree) {
                                lib.onfree.push(() => {
                                    event.dialogxx = ui.create.characterDialog('heightset', name => {
                                        const info = get.character(name);
                                        return info.doubleGroup.length > 0 || info.group !== game.me.identity;
                                    });
                                    if (ui.cheat2) {
                                        ui.cheat2.animate('controlpressdownx', 500);
                                        ui.cheat2.classList.remove('disabled');
                                    }
                                });
                            }
                            else {
                                event.dialogxx = ui.create.characterDialog('heightset', name => {
                                    const info = get.character(name);
                                    return info.doubleGroup.length > 0 || info.group !== player.identity;
                                });
                            }
                            ui.create.cheat = function () {
                                _status.createControl = ui.cheat2;
                                ui.cheat = ui.create.control('更换', function () {
                                    if (ui.cheat2 && ui.cheat2.dialog == _status.event.dialog) return;
                                    let list = _status.characterlist.filter(name => get.character(name).group == player.identity && !aiList.includes(name)).randomGets(10);
                                    if (!lib.config.singleControl) list.randomRemove(5);
                                    const buttons = ui.create.div('.buttons');
                                    const node = _status.event.dialog.buttons[0].parentNode;
                                    _status.event.dialog.buttons = ui.create.buttons(list, 'character', buttons);
                                    _status.event.dialog.content.insertBefore(buttons, node);
                                    buttons.animate('start');
                                    node.remove();
                                    game.uncheck();
                                    game.check();
                                });
                                delete _status.createControl;
                            };
                            ui.create.cheat2 = function () {
                                ui.cheat2 = ui.create.control('自由选将', function () {
                                    if (this.dialog == _status.event.dialog) {
                                        this.dialog.close();
                                        _status.event.dialog = this.backup;
                                        this.backup.open();
                                        delete this.backup;
                                        game.uncheck();
                                        game.check();
                                        if (ui.cheat) {
                                            ui.cheat.animate('controlpressdownx', 500);
                                            ui.cheat.classList.remove('disabled');
                                        }
                                    }
                                    else {
                                        this.backup = _status.event.dialog;
                                        _status.event.dialog.close();
                                        _status.event.dialog = _status.event.parent.dialogxx;
                                        this.dialog = _status.event.dialog;
                                        this.dialog.open();
                                        game.uncheck();
                                        game.check();
                                        if (ui.cheat) ui.cheat.classList.add('disabled');
                                    }
                                });
                                if (lib.onfree) ui.cheat2.classList.add('disabled');
                            }
                            if (!ui.cheat) ui.create.cheat();
                            if (!ui.cheat2) ui.create.cheat2();
                            const result = await player.chooseButton(createDialog, (lib.config.singleControl ? 2 : 1), true).set('filterButton', button => {
                                const event = get.event();
                                if (lib.config.singleControl || (ui.cheat2 && ui.cheat2.dialog == event.getParent().dialog)) return true;
                                return (ui.selected.buttons.length > 0) === event.list.includes(button.link);
                            }).set('onfree', true).set('list', aiList).forResult();
                            if (ui.cheat) {
                                ui.cheat.close();
                                delete ui.cheat;
                            }
                            if (ui.cheat2) {
                                ui.cheat2.close();
                                delete ui.cheat2;
                            }
                            //玩家方初始化
                            _status.characterlist.removeArray(result.links);
                            game.addRecentCharacter(...result.links);
                            player.init(result.links[0]);
                            player.addMark('_lz_zong_mark', 2);
                            if (lib.config.extension_活动萌扩_JiaZhuAwaken) {
                                player._LZ_jiazuAwaken = true;
                                game.log(player, '已激活家族特殊技能');
                            }
                            player.setLevel(lib.config.extension_活动萌扩_getLevel);
                            switch (player.lz_levelNum) {
                                case '3':
                                    player.maxHp = player.maxHp + 1;
                                    player.hp = player.hp + 1;
                                    player.update();
                                    break;
                                case '4':
                                    player.maxHp = player.maxHp + 1;
                                    player.hp = player.hp + 1;
                                    player.update();
                                    break;
                                case '5':
                                    player.addSkill('LZ_chongsheng');
                                    player.maxHp = player.maxHp + 2;
                                    player.hp = player.hp + 2;
                                    player.update();
                                    break;
                            }
                            if (fellow) {
                                fellow.init(result.links[1] || (list => {
                                    let listx = [], num = 0;
                                    for (const name of list) {
                                        const numx = get.rank(name, true);
                                        if (numx > num) {
                                            num = numx;
                                            listx = [name];
                                        }
                                        else if (numx == num) listx.push(name);
                                    }
                                    return listx;
                                })(aiList).randomGet());
                                if (lib.config.extension_活动萌扩_JiaZhuAwaken) {
                                    fellow._LZ_jiazuAwaken = true;
                                    game.log(fellow, '已激活家族特殊技能');
                                }
                                fellow.addMark('_lz_zong_mark', 2);
                                fellow.setLevel(lib.config.extension_活动萌扩_getLevel);
                                switch (fellow.lz_levelNum) {
                                    case '3':
                                        fellow.maxHp = fellow.maxHp + 1;
                                        fellow.hp = fellow.hp + 1;
                                        fellow.update();
                                        break;
                                    case '4':
                                        fellow.maxHp = fellow.maxHp + 1;
                                        fellow.hp = fellow.hp + 1;
                                        fellow.update();
                                        break;
                                    case '5':
                                        fellow.addSkill('LZ_chongsheng');
                                        fellow.maxHp = fellow.maxHp + 2;
                                        fellow.hp = fellow.hp + 2;
                                        fellow.update();
                                        break;
                                }
                            }
                            if (!ui.giveupSystem && (!fellow || lib.config.singleControl)) {
                                ui.giveupSystem = ui.create.system('投降', function () {
                                    game.log(game.me, '投降');
                                    game.over(false);
                                }, true);
                            }
                            setTimeout(() => ui.arena.classList.remove('choose-character'), 500);
                        });
                    },
                },
                lib: {
                    card: {
                        xionghuangjiu: {
                            image: 'ext:活动萌扩/image/xionghuangjiu.png',
                            fullimage: true,
                            type: "basic",
                            enable(event, player) {
                                return !player.hasSkill('jiu');
                            },
                            lianheng: true,
                            logv: false,
                            savable(card, player, dying) {
                                return dying == player;
                            },
                            usable: 1,
                            selectTarget: -1,
                            modTarget: true,
                            filterTarget(card, player, target) {
                                return target == player;
                            },
                            content() {
                                if (target.isDying()) {
                                    target.recover();
                                    if (_status.currentPhase == target) {
                                        target.getStat().card.jiu--;
                                    }
                                }
                                else {
                                    if (cards && cards.length) {
                                        card = cards[0];
                                    }
                                    game.broadcastAll(function (target, card, gain2) {
                                        if (!target.storage.jiu) target.storage.jiu = 0;
                                        target.storage.jiu++;
                                        target.addSkill('jiu');
                                        game.addVideo('jiuNode', target, true);
                                        if (!target.node.jiu && lib.config.jiu_effect) {
                                            target.node.jiu = ui.create.div('.playerjiu', target.node.avatar);
                                            target.node.jiu2 = ui.create.div('.playerjiu', target.node.avatar2);
                                        }
                                        if (gain2 && card.clone && (card.clone.parentNode == target.parentNode || card.clone.parentNode == ui.arena)) {
                                            card.clone.moveDelete(target);
                                        }
                                    }, target, card, target == targets[0]);
                                    if (target == targets[0]) {
                                        if (card.clone && (card.clone.parentNode == target.parentNode || card.clone.parentNode == ui.arena)) {
                                            game.addVideo('gain2', target, get.cardsInfo([card]));
                                        }
                                    }
                                }
                            },
                            ai: {
                                basic: {
                                    useful(card, i) {
                                        if (_status.event.player.hp > 1) {
                                            if (i == 0) return 5;
                                            return 1;
                                        }
                                        if (i == 0) return 7.3;
                                        return 3;
                                    },
                                    value(card, player, i) {
                                        if (player.hp > 1) {
                                            if (i == 0) return 5;
                                            return 1;
                                        }
                                        if (i == 0) return 7.3;
                                        return 3;
                                    },
                                },
                                order() {
                                    return get.order({ name: 'sha' }) + 0.2;
                                },
                                result: {
                                    target(player, target) {
                                        if (target && target.isDying()) return 2;
                                        if (lib.config.mode == 'stone' && !player.isMin()) {
                                            if (player.getActCount() + 1 >= player.actcount) return 0;
                                        }
                                        var shas = player.getCards('h', 'sha');
                                        if (shas.length > 1 && player.getCardUsable('sha') > 1) {
                                            return 0;
                                        }
                                        var card;
                                        if (shas.length) {
                                            for (var i = 0; i < shas.length; i++) {
                                                if (lib.filter.filterCard(shas[i], target)) {
                                                    card = shas[i]; break;
                                                }
                                            }
                                        }
                                        else if (player.hasSha() && player.needsToDiscard()) {
                                            if (player.countCards('h', 'hufu') != 1) {
                                                card = { name: 'sha' };
                                            }
                                        }
                                        if (card) {
                                            if (game.hasPlayer(function (current) {
                                                return (get.attitude(target, current) < 0 &&
                                                    target.canUse(card, current, true, true) &&
                                                    !current.getEquip('baiyin') &&
                                                    get.effect(current, card, target) > 0);
                                            })) {
                                                return 1;
                                            }
                                        }
                                        return 0;
                                    },
                                },
                                tag: {
                                    save: 1
                                },
                            },
                        },
                        tongzhougongji: {
                            image: 'ext:活动萌扩/image/tongzhougongji.png',
                            fullimage: true,
                            enable: true,
                            type: 'trick',
                            selectTarget: -1,
                            filterTarget(card, player, target) {
                                return player.identity == target.identity;
                            },
                            content() {
                                target.draw('nodelay');
                            },
                            ai: {
                                basic: {
                                    order: 9,
                                    useful: 3,
                                    value: 4,
                                },
                                result: {
                                    target: 1,
                                },
                                tag: {
                                    draw: 1,
                                    multitarget: 1,
                                },
                            },
                        },
                        lizhengshangyou: {
                            image: 'ext:活动萌扩/image/lizhengshangyou.png',
                            fullimage: true,
                            type: 'trick',
                            enable: true,
                            selectTarget: -1,
                            filterTarget: true,
                            content() {
                                target.draw(player.identity == target.identity ? game.countGroup() : 1, 'nodelay');
                            },
                            ai: {
                                basic: {
                                    order: 7,
                                    useful: 5,
                                    value: 7,
                                },
                                result: {
                                    target(player, target) {
                                        return player.identity == target.identity ? 100 : 1;
                                    },
                                },
                                tag: {
                                    draw: 3,
                                    multitarget: 1,
                                },
                            },
                        },
                        nishuixingzhou: {
                            image: 'ext:活动萌扩/image/nishuixingzhou.png',
                            fullimage: true,
                            enable: true,
                            type: 'trick',
                            filterTarget(card, player, target) {
                                return player.identity != target.identity;
                            },
                            content() {
                                for (var i of game.filterPlayer(function (current) {
                                    return target.identity == current.identity;
                                })) {
                                    player.line(i);
                                    i.damage();
                                }
                            },
                            ai: {
                                basic: {
                                    order: 7.2,
                                    useful: 7,
                                    value: 7.5,
                                },
                                result: {
                                    target: -1,
                                },
                                tag: {
                                    damage: 1
                                },
                            },
                        },
                    },
                    skill: {
                        //非同身份不能救助
                        _longzhou_save: {
                            charlotte: true,
                            ruleSkill: true,
                            mod: {
                                cardSavable(card, player, target) {
                                    if (player.identity != target.identity) return false;
                                },
                            },
                        },
                        //家族技能
                        _LZ_jiazu_wei: {
                            trigger: { player: 'phaseBegin' },
                            direct: true,
                            filter(event, player) {
                                return player.identity == 'wei' && player.countCards('he') > 0;
                            },
                            content() {
                                'step 0'
                                player.chooseCardTarget({
                                    prompt: get.prompt2(event.name),
                                    filterCard: lib.filter.cardDiscardable,
                                    filterTarget(card, player, target) {
                                        return player.identity != target.identity;
                                    },
                                    position: 'he',
                                    ai1(card) {
                                        return 6 - get.value(card);
                                    },
                                    ai2(target) {
                                        var player = _status.event.player;
                                        return (2 - get.sgn(get.attitude(player, target))) / (target.countCards('he') + 1);
                                    },
                                });
                                'step 1'
                                if (result.bool) {
                                    player.logSkill(event.name, result.targets);
                                    player.discard(result.cards);
                                    result.targets[0].chooseToDiscard('弃置一张牌，或令' + get.translation(player) + '摸一张牌', 'he').ai = lib.skill.zhiheng.check;
                                }
                                else event.finish();
                                'step 2'
                                if (!result.bool) player.draw();
                            },
                        },
                        _LZ_jiazu_shu: {
                            trigger: { player: 'phaseUseEnd' },
                            forced: true,
                            filter(event, player) {
                                return player.identity == 'shu' && player.getHistory('useCard', function (evt) {
                                    return evt.card && evt.card.name == 'sha' && evt.getParent('phaseUse') == event;
                                }).length > 1;
                            },
                            content() {
                                player.draw();
                            },
                        },
                        _LZ_jiazu_wu: {
                            trigger: { player: 'phaseEnd' },
                            forced: true,
                            filter(event, player) {
                                return player.identity == 'wu' && player.countCards('h') != player.hp;
                            },
                            content() {
                                player.draw();
                            },
                        },
                        _LZ_jiazu_qun: {
                            trigger: { player: 'phaseDiscardBegin' },
                            forced: true,
                            filter(event, player) {
                                return player.identity == 'qun' && (player.isDamaged() || player.countCards('h') - player.hp > 1);
                            },
                            content() {
                                var num = 0;
                                if (player.isDamaged()) num++;
                                if (player.countCards('h') - player.hp > 1) num++;
                                player.addMark('LZqunxin_temp', num, false);
                                player.addTempSkill('LZqunxin_temp', 'phaseDiscardEnd');
                            },
                        },
                        _LZ_jiazu_jin: {
                            trigger: { player: 'phaseBegin' },
                            filter(event, player) {
                                var hs = player.getCards('h');
                                return player.identity == 'jin' && player.countCards('he');
                            },
                            check(event, player) {
                                var hs = player.getCards('h'), cards = [], suits = [];
                                player.getHistory('gain', function (evt) {
                                    if (evt.getParent().name != 'draw' || evt.getParent('phaseDraw') != event) return false;
                                    for (var i of evt.cards) {
                                        if (hs.includes(i)) {
                                            cards.add(i);
                                            suits.add(get.suit(i, player));
                                        }
                                    }
                                });
                                return cards.length == suits.length;
                            },
                            direct: true,
                            content() {
                                'step 0'
                                player.chooseToDiscard('he', get.prompt2('_LZ_jiazu_jin')).set('ai', function (card) {
                                    if (!get.cardPile2(function (cardx) {
                                        return get.suit(cardx, false) == get.suit(card, player);
                                    })) return -1;
                                    return lib.skill.zhiheng.check(card);
                                }).logSkill = '_LZ_jiazu_jin';
                                'step 1'
                                if (result.bool) {
                                    var suit = get.suit(result.cards[0], player);
                                    var card = get.cardPile2(function (card) {
                                        return get.suit(card, false) == suit;
                                    });
                                    if (card) player.gain(card, 'gain2');
                                }
                            },
                        },
                        LZqunxin_temp: {
                            noGlobal: true,
                            onremove: true,
                            mod: {
                                maxHandcard(player, num) {
                                    return num + player.countMark('LZqunxin_temp');
                                },
                            },
                        },
                        _LZ_jiazu_awaken_wei: {
                            popup: '许昌',
                            intro: {
                                content: '锁定技，当你受到伤害后，你摸一张牌。',
                            },
                            trigger: { player: 'damageEnd' },
                            forced: true,
                            filter(event, player) {
                                return player._LZ_jiazuAwaken && player.identity == 'wei';
                            },
                            content() {
                                player.draw();
                            },
                        },
                        _LZ_jiazu_awaken_shu: {
                            popup: '成都',
                            intro: {
                                content: '锁定技，当你使用【杀】造成伤害后，你摸一张牌。',
                            },
                            trigger: { source: 'damageSource' },
                            forced: true,
                            filter(event, player) {
                                return player._LZ_jiazuAwaken && player.identity == 'shu' && event.card && event.card.name == 'sha';
                            },
                            content() { player.draw() },
                        },
                        _LZ_jiazu_awaken_wu: {
                            popup: '武昌',
                            intro: {
                                content: '锁定技，当你使用装备牌时，你摸一张牌。',
                            },
                            trigger: { player: 'useCard' },
                            forced: true,
                            filter(event, player) {
                                return player._LZ_jiazuAwaken && player.identity == 'wu' && get.type(event.card) == 'equip';
                            },
                            content() {
                                player.draw();
                            },
                        },
                        _LZ_jiazu_awaken_qun: {
                            popup: '邺城',
                            intro: {
                                content: '锁定技，当你使用锦囊牌指定其他角色为目标后，你摸一张牌。',
                            },
                            trigger: { player: 'useCardToPlayered' },
                            forced: true,
                            filter(event, player) {
                                if (!player._LZ_jiazuAwaken || player.identity != 'qun' || !event.isFirstTarget || get.type(event.card, 'trick') != 'trick') return false;
                                for (var i = 0; i < event.targets.length; i++) {
                                    if (event.targets[i] != player) return true;
                                }
                                return false;
                            },
                            content() {
                                player.draw();
                            },
                        },
                        _LZ_jiazu_awaken_jin: {
                            popup: '洛阳',
                            intro: {
                                content: '锁定技，结束阶段，若你手牌中的花色数小于3，则你摸一张牌。',
                            },
                            trigger: { player: 'phaseJieshuBegin' },
                            forced: true,
                            filter(event, player) {
                                if (!player._LZ_jiazuAwaken || player.identity != 'jin') return false;
                                var hs = player.getCards('h'), suits = [];
                                if (hs.length < 3) return true;
                                for (var i of hs) {
                                    suits.add(get.suit(i, player));
                                    if (suits.length > 2) return false;
                                }
                                return true;
                            },
                            content() {
                                player.draw();
                            },
                        },
                        //重生
                        LZ_chongsheng: {
                            charlotte: true,
                            unique: true,
                            enable: 'chooseToUse',
                            mark: true,
                            limited: true,
                            skillAnimation: true,
                            animationColor: 'orange',
                            filter(event, player) {
                                if (event.type == 'dying') {
                                    if (player != event.dying) return false;
                                    return true;
                                }
                                return false;
                            },
                            content() {
                                'step 0'
                                player.awakenSkill('LZ_chongsheng');
                                player.discard(player.getCards('j'));
                                'step 1'
                                player.link(false);
                                player.turnOver(false);
                                'step 2'
                                player.draw(5);
                                if (player.hp < 5) player.recover(5 - player.hp);
                            },
                            ai: {
                                order: 10,
                                save: true,
                                skillTagFilter(player, arg, target) {
                                    if (player != target) return false;
                                },
                                result: { player: 1 },
                            },
                        },
                        //2023年新机制粽子
                        //粽+全局效果
                        _lz_zong_mark: {
                            mod: {
                                cardUsable(card, player, num) {
                                    if (card.name == 'sha' && player.lz_levelNum && parseInt(player.lz_levelNum) >= 3) return num + 1;
                                },
                            },
                            marktext: '粽',
                            intro: { name2: '棕', content: 'mark' },
                            charlotte: true,
                            trigger: { source: ['damageBegin4', 'dieBegin'] },
                            filter(event, player) {
                                return event.name == 'damage' || event.player.countMark('_lz_zong_mark');
                            },
                            direct: true,
                            priority: 2023,
                            content() {
                                player.addMark('_lz_zong_mark', trigger.name == 'damage' ? trigger.num : trigger.player.countMark('_lz_zong_mark'));
                                if (trigger.name == 'die') trigger.player.unmarkSkill('_lz_zong_mark');
                            },
                        },
                        _lz_equip: {
                            charlotte: true,
                            trigger: { global: 'phaseBefore' },
                            filter(event, player) {
                                /*
                                var bool=false;
                                for(var i=1;i<=5;i++){
                                if(player.isEmpty(i)){
                                bool=true;
                                break;
                                }
                                }
                                */
                                return game.phaseNumber == 0 && player.identity == game.me.identity/*&&bool*/;
                            },
                            direct: true,
                            priority: 2023,
                            content() {
                                /*
                                var equips=[];
                                for(var i=1;i<=5;i++){
                                if(player.isEmpty(i)) equips.push('equip'+i);
                                }
                                */
                                var card = get.cardPile(function (card) {
                                    return get.type(card) == 'equip'/*&&equips.includes(get.subtype(card))*/;
                                });
                                if (card) player.chooseUseTarget(card, 'nopopup', 'noanimate', true);
                            },
                        },
                        lz_dakuaiduoyi: {
                            charlotte: true,
                            trigger: { player: 'useCard' },
                            filter(event, player) {
                                return get.type2(event.card) == 'trick' && player.countMark('_lz_zong_mark') >= 2;
                            },
                            forced: true,
                            content() {
                                player.removeMark('_lz_zong_mark', 2);
                                player.draw();
                            },
                        },
                        lz_wuweijuquan: {
                            charlotte: true,
                            trigger: { source: 'damageBegin1' },
                            filter(event, player) {
                                return player.countMark('_lz_zong_mark') >= 4;
                            },
                            forced: true,
                            content() {
                                player.removeMark('_lz_zong_mark', 4);
                                trigger.num++;
                            },
                        },
                        lz_huiweuwuqiong: {
                            charlotte: true,
                            trigger: { source: 'damageSource' },
                            filter(event, player) {
                                return event.card && event.card.name == 'sha' && player.countMark('_lz_zong_mark') >= 2;
                            },
                            forced: true,
                            content() {
                                player.removeMark('_lz_zong_mark', 2);
                                player.draw();
                            },
                        },
                        lz_zhucuizhizhen: {
                            charlotte: true,
                            trigger: { player: 'useCard' },
                            filter(event, player) {
                                return get.type2(event.card) == 'equip' && player.countMark('_lz_zong_mark');
                            },
                            forced: true,
                            content() {
                                player.removeMark('_lz_zong_mark', 1);
                                player.draw();
                            },
                        },
                        lz_jinjinyouwei: {
                            charlotte: true,
                            trigger: { player: 'recoverEnd' },
                            filter(event, player) {
                                return event.card && event.card.name == 'tao' && player.countMark('_lz_zong_mark') >= 4;
                            },
                            forced: true,
                            content() {
                                player.removeMark('_lz_zong_mark', 4);
                                player.recover();
                            },
                        },
                        lz_zhenxiumeizhuan: {
                            charlotte: true,
                            trigger: { player: 'phaseDrawBegin' },
                            filter(event, player) {
                                return player.countMark('_lz_zong_mark');
                            },
                            forced: true,
                            content() {
                                var num = player.countMark('_lz_zong_mark');
                                player.removeMark('_lz_zong_mark', num);
                                player.draw(Math.floor(num / 2));
                            },
                        },
                        lz_chuixianyudi: {
                            charlotte: true,
                            trigger: { player: 'phaseJieshuBegin' },
                            filter(event, player) {
                                return player.countMark('_lz_zong_mark');
                            },
                            forced: true,
                            content() {
                                var num = player.countMark('_lz_zong_mark');
                                player.removeMark('_lz_zong_mark', num);
                                player.draw(Math.floor(num / 2));
                            },
                        },
                        lz_jiuzufanbao: {
                            mod: {
                                cardUsable(card, player, num) {
                                    if (card.name == 'sha' && player.countMark('_lz_zong_mark') >= 6) return num + 1;
                                },
                                targetInRange(card, player) {
                                    if (player.countMark('_lz_zong_mark') >= 4) return true;
                                },
                            },
                            charlotte: true,
                            trigger: { player: ['phaseDrawBegin2', 'phaseJieshuBegin'] },
                            filter(event, player) {
                                if (player.countMark('_lz_zong_mark') < 2) return false;
                                return event.name == 'phaseJieshu' || !event.numFixed;
                            },
                            forced: true,
                            content() {
                                if (trigger.name == 'phaseJieshu') {
                                    var num = player.countMark('_lz_zong_mark');
                                    player.removeMark('_lz_zong_mark', Math.floor(num / 2));
                                }
                                else trigger.num++;
                            },
                        },
                    },
                    translate: {
                        _LZ_jiazu_wei: '魏业',
                        _LZ_jiazu_wei_info: '回合开始时，你可以弃置一张牌并指定一名敌方角色，该角色选择一项：①弃置一张牌；②你摸一张牌。',
                        _LZ_jiazu_shu: '蜀义',
                        _LZ_jiazu_shu_info: '出牌阶段结束时，若你于此阶段使用【杀】的次数不少于2，摸一张牌。',
                        _LZ_jiazu_wu: '吴耀',
                        _LZ_jiazu_wu_info: '回合结束时，若你的手牌数不等于你的体力值，则你摸一张牌。',
                        _LZ_jiazu_qun: '群心',
                        _LZ_jiazu_qun_info: '锁定技，弃牌阶段开始时，若你的手牌数比体力值多2或更多，你本回合手牌上限+1；若你已损失体力值大于1，你手牌上限+1',
                        _LZ_jiazu_jin: '晋势',
                        _LZ_jiazu_jin_info: '回合开始时，你可以弃置一张牌，从牌堆中随机获得一张与此牌花色相同的牌。',
                        _LZ_jiazu_awaken_wei: '许昌',
                        _LZ_jiazu_awaken_wei_info: '锁定技，当你受到伤害后，你摸一张牌。',
                        _LZ_jiazu_awaken_shu: '成都',
                        _LZ_jiazu_awaken_shu_info: '锁定技，当你使用【杀】造成伤害后，你摸一张牌。',
                        _LZ_jiazu_awaken_wu: '武昌',
                        _LZ_jiazu_awaken_wu_info: '锁定技，当你使用装备牌时，你摸一张牌。',
                        _LZ_jiazu_awaken_qun: '邺城',
                        _LZ_jiazu_awaken_qun_info: '锁定技，当你使用锦囊牌指定其他角色为目标后，你摸一张牌。',
                        _LZ_jiazu_awaken_jin: '洛阳',
                        _LZ_jiazu_awaken_jin_info: '锁定技，结束阶段，若你手牌中的花色数小于3，则你摸一张牌。',
                        xionghuangjiu: '雄黄酒',
                        xionghuangjiu_info: '①出牌阶段对自己使用，本回合使用的下一张【杀】伤害+1；②当你处于濒死状态时，对自己使用，你回复1点体力。',
                        tongzhougongji: '同舟共济',
                        tongzhougongji_info: '出牌阶段，对自己和队友使用，目标角色各摸一张牌。',
                        lizhengshangyou: '力争上游',
                        lizhengshangyou_info: '出牌阶段，对所有角色使用，你和与你势力相同的角色各摸x张牌，其他角色摸一张牌（x为当前场上势力数）。',
                        nishuixingzhou: '逆水行舟',
                        nishuixingzhou_info: '出牌阶段，对一名与你势力不同的角色使用，对其和与其势力相同的角色各造成1点伤害。',
                        LZ_chongsheng: '重生',
                        LZ_chongsheng_info: '限定技，当你处于濒死状态时，你可以弃置判定区内的所有牌，然后复原你的武将牌，摸五张牌，将体力回复至体力上限（至多为5）。',
                        _lz_zong_mark: '粽',
                        lz_dakuaiduoyi: '大快朵颐',
                        lz_wuweijuquan: '五味俱全',
                        lz_huiweuwuqiong: '回味无穷',
                        lz_zhucuizhizhen: '珠翠之珍',
                        lz_jinjinyouwei: '津津有味',
                        lz_zhenxiumeizhuan: '珍馐美馔',
                        lz_chuixianyudi: '垂涎欲滴',
                        lz_jiuzufanbao: '酒足饭饱',
                    },
                    element: {
                        player: {
                            logAi() { },
                            setLevel(level = '1') {
                                const player = this;
                                player.lz_levelNum = level;
                                level = Number(level);
                                if (level == 3) player.node.framebg.dataset.decoration = 'bronze';
                                else if (level == 4) player.node.framebg.dataset.decoration = 'silver';
                                else if (level == 5) player.node.framebg.dataset.decoration = 'gold';
                                else player.node.framebg.dataset.decoration = 'none';
                                player.node.framebg.dataset.auto = player.node.framebg.dataset.decoration;
                            },
                            getFriends(func, includeDie, includeOut) {
                                const player = this, method = includeDie ? "filterPlayer2" : "filterPlayer", identity = player.identity;
                                var self = false;
                                if (func === true) {
                                    func = null;
                                    self = true;
                                }
                                return game[method](function (current) {
                                    if (!self && current == player) return false;
                                    return current.identity == identity;
                                }, [], includeOut);
                            },
                            getEnemies(func, includeDie, includeOut) {
                                const player = this, method = includeDie ? "filterPlayer2" : "filterPlayer", identity = player.identity;
                                return game[method](function (current) {
                                    return current.identity != identity;
                                }, [], includeOut);
                            },
                            isFriendOf(player, includeDie, includeOut) {
                                return this.getFriends(true, includeDie, includeOut).includes(player);
                            },
                            isEnemyOf(player, includeDie, includeOut) {
                                return this.getEnemies(true, includeDie, includeOut).includes(player);
                            },
                            dieAfter() {
                                game.checkResult();
                            },
                        },
                    },
                },
            };
            Object.assign(get, changeFunction.get);
            Object.assign(game, changeFunction.game);
            Object.assign(lib.translate, changeFunction.lib.translate);
            Object.assign(lib.character, changeFunction.lib.character);
            Object.assign(lib.skill, changeFunction.lib.skill);
            for (const i in changeFunction.lib.skill) game.finishSkill(i);
            Object.assign(lib.element.player, changeFunction.lib.element.player);
            //游戏初始阵型
            let choice = lib.config.extension_活动萌扩_chooseGroup;
            let list = [],groupList = ['wei', 'shu', 'wu', 'qun', 'jin'].randomSort();
            groupList.remove(choice);
            groupList = groupList.randomGets(1);
            for (let i of [choice].addArray(groupList)) {
                for (let j = 1; j <= 2; j++) list.push(i);
            }
            game.zhu = _status.firstAct2 = (() => {
                if (lib.config.singleControl) return game.me;
                return [game.me, game.me[game.players.indexOf(game.me) % 2 == 0 ? 'previous' : 'pnext']].randomGet();
            })();
            game.players.sortBySeat(game.zhu);
            //定义座位号和座位号显示
            game.players.forEach((current, index) => {
                current.setSeatNum(index + 1);
                if (!current.node.seat) current.setNickname(get.cnNumber(current.seatNum, true) + '号位');
                current.identity = list[index];
                current.setIdentity();
                current.identityShown = true;
                Object.assign(current, changeFunction.lib.element.player);
            });
            game.showIdentity(true);
        },
    },
};
export default brawl;