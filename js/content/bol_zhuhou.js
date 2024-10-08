import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
//春节--狂神解禁
game.isInSpringFestival = function () {
    const date = new Date(), time = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
    };
    return time.year == 2024 && time.month == 2 && time.day >= 10 && time.day <= 24;
};
const brawl = {
    name: "诸侯伐董",
    mode: "identity",
    intro: (() => {
        let intro = [
            '<span class=\'texiaotext\' style=\'color:#FF0000\'>声明：本扩展原作者为橙续缘，修改更新者为萌新（转型中），目前原作者已退坑，侵删</span>',
            "游戏背景：董卓权倾朝野，荒淫无度，群雄奋起而伐之，可是董卓军势大，旗下拥有众多良将精锐。现在能不能平叛董卓之乱，这重任就托付于你们身上了！",
            "游戏人数：<ul><li>常规关卡：2盟军(己方)vs3董卓军(敌方)</li><li>特殊关卡：3盟军(己方)vs5董卓军(敌方)</li></ul>",
            '禁将：SP贾诩(OL)、步骘、灵雎、SP关羽(OL)、标袁术(OL)、左慈、黄皓(OL)、大乔、徐晃、韩浩史涣，神武将',
            "特殊规则：<ul><li>(1) 己方角色起始手牌+1</li><li>(2) 一名己方角色阵亡后，若伤害来源不是己方角色，则己方角色摸三张牌</li></ul>",
            "胜利条件：击败关卡将领",
        ];
        if (game.isInSpringFestival()) {
            intro.unshift('<span class=\'texiaotext\' style=\'color:#FF0000\'>春节期间牢狂出没，boss挑战限时开启，己方所有角色坐拥三倍体力！击败可获得114514萌币！</span>');
            intro[1] = intro[1].slice(intro[1].indexOf('声明')).slice(0, -7);
        }
        return intro;
    })(),
    init: function () {
        if (!_status.characterlist) lib.skill.pingjian.initList();
        _status.characterlist.removeArray(["sp_jiaxu", "buzhi", "sp_guanyu", "ol_yuanshu", "huanghao"]);
        _status.characterlist.removeArray(_status.characterlist.filter(i => lib.character[i][1] == 'shen'));
        for (var name of ["lingju", "zuoci", "xuhuang", "hanhaoshihuan", 'daqiao']) {
            _status.characterlist.removeArray(_status.characterlist.filter(i => i.indexOf(name) != -1));
        }
        _status.cxyCPState = ['normal', 'special'].randomGet();
        var pack = {
            mojunPack: {
                character: {
                    cxyLiJue: ["male", "qun", 6, ["cxyYangWu", "cxyMoJun"], ['ext:活动萌扩/image/cxyLijue.jpg']],
                    cxyGuoSi: ["male", "qun", 4, ["cxyYangLie", "cxyMoJun"], ['ext:活动萌扩/image/cxyGuoSi.jpg']],
                    cxyZhangJi: ["male", "qun", 4, ["cxyJieLve", "cxyMoJun"], ['ext:活动萌扩/image/cxyZhangJi.jpg']],
                    cxyFanChou: ["male", "qun", 4, ["cxyFanGong", "cxyMoJun"], ['ext:活动萌扩/image/cxyFanChou.jpg']],
                    cxyDongYue: ["male", "qun", 4, ["cxyKuangXi", "cxyMoJun"], ['ext:活动萌扩/image/cxyDongYue.jpg']],
                    cxyNiuFuDongXie: ["male", "qun", 4, ["cxyTunJun", "cxyJiaoXia", "cxyMoJun"], ['ext:活动萌扩/image/cxyNiuFuDongXie.jpg']],
                    'fd_kuangshen04': ['male', 'shen', '4/6', ['fd_makeBug', 'fd_tequ', 'fd_guoshou', 'reqimou', 'zhaxiang', 'tairan', 'cxyMoJun'], ['ext:活动萌扩/image/fd_kuangshen04.jpg']],
                },
                skill: {
                    //牢狂
                    fd_makeBug: {
                        charlotte: true,
                        trigger: { player: 'phaseEnd' },
                        forced: true,
                        async content(event, trigger, player) {
                            if (player.countCards('h') < 7) await player.drawTo(7);
                            const target = (game.me.isIn() && !game.me.isFriendOf(player)) ? game.me : game.me.getEnemies().randomGet();
                            let cards = player.getCards('h');
                            if (!cards.length) {
                                player.chat('谁在阻止我提PR？');//[doge]
                                game.over(game.me.isFriendOf(player));
                                return;
                            }
                            const Original = cards.randomGet(), PR = lib.card.list.randomGet();
                            const card = game.createCard(get.name(Original, false), PR[0], PR[1]);
                            cards[cards.indexOf(Original)] = card;
                            const { result: { bool, links } } = await target.chooseButton(['请猜测' + get.translation(player) + '伪装的手牌', cards], true).set('ai', button => {
                                const cards = get.event('cards').slice();
                                const card = cards.find(card => lib.card.list.some(cardx => cardx[2] == get.name(card, false)) && !lib.card.list.some(cardx => cardx[2] == get.name(card, false) && cardx[0] == get.suit(card, false) && cardx[0] == get.number(card, false) && cardx[3] == get.nature(card, false)));
                                return button.link == card ? 3 : 1 + Math.random();
                            }).set('cards', cards);
                            if (bool) {
                                if (links[0] == card) {
                                    target.popup('判断正确', 'wood');
                                    game.log(target, '猜测', '#g正确');
                                }
                                else {
                                    target.popup('判断错误', 'fire');
                                    game.log(target, '猜测', '#y错误');
                                    player.gain(lib.skill.fd_makeBug.getYing(2), 'gain2');
                                    game.cardsGotoPile(lib.skill.fd_makeBug.getYing(20), () => ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length - 1)]);
                                }
                            }
                        },
                        getYing(count) {
                            let cards = [];
                            if (typeof count != 'number') count = 1;
                            while (count--) {
                                let card = game.createCard2('ying', 'none', 114514);
                                cards.push(card);
                            }
                            return cards;
                        },
                    },
                    fd_tequ: {
                        charlotte: true,
                        enable: ['chooseToUse', 'chooseToRespond'],
                        filter(event, player) {
                            if (!player.countCards('hes', card => get.card(name, player) == 'ying')) return false;
                            return get.inpileVCardList(info => info[0] != 'equip').some(info => event.filterCard({ name: info[2], nature: info[3] }, player, event));
                        },
                        chooseButton: {
                            dialog(event, player) {
                                var list = get.inpileVCardList(info => info[0] != 'equip').filter(info => event.filterCard({ name: info[2], nature: info[3] }, player, event));
                                return ui.create.dialog('特取', [list, 'vcard']);
                            },
                            filter(button, player) {
                                return get.event().getParent().filterCard({ name: button.link[2] }, player, _status.event.getParent());
                            },
                            check(button) {
                                if (get.event().getParent().type != 'phase') return 1;
                                const player = get.event('player');
                                return player.getUseValue({ name: button.link[2], nature: button.link[3] });
                            },
                            backup(links, player) {
                                return {
                                    charlotte: true,
                                    filterCard(card, player) {
                                        return get.name(card, player) == 'ying';
                                    },
                                    popname: true,
                                    check() { return 1 },
                                    position: 'hes',
                                    viewAs: { name: links[0][2], nature: links[0][3] },
                                }
                            },
                            prompt(links, player) {
                                return '将一张【影】当做' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]) + '使用或打出';
                            }
                        },
                        hiddenCard(player, name) {
                            if (!lib.inpile.includes(name) || !player.countCards('hes')) return false;
                            const type = get.type2(name);
                            return type == 'basic' || type == 'trick';
                        },
                        ai: {
                            fireAttack: true,
                            respondSha: true,
                            respondShan: true,
                            skillTagFilter(player) {
                                if (!player.countCards('hes')) return false;
                            },
                            order: 10,
                            result: {
                                player(player) {
                                    if (_status.event.dying) return get.attitude(player, _status.event.dying);
                                    return 1;
                                },
                            },
                        },
                        subSkill: { backup: {} },
                    },
                    fd_guoshou: {
                        init() {
                            game.broadcastAll(() => {
                                if (lib.card.ying.destroy) delete lib.card.ying.destroy;
                                lib.translate.ying_info = '此牌堆已被牢狂污染';
                            });
                        },
                        charlotte: true,
                        trigger: { global: ['useCard1', 'damageBefore'] },
                        filter(event, player) {
                            if (event.player == player) return false;
                            if (event.name == 'useCard') return event.player != player && get.tag(event.card, 'damage');
                            return !event.source || event.source != player;
                        },
                        forced: true,
                        logTarget: 'player',
                        async content(event, trigger, player) {
                            if (trigger.name == 'useCard') trigger.customArgs.default.customSource = player;
                            else trigger.source = player;
                        },
                        group: 'fd_guoshou_win',
                        subSkill: {
                            win: {
                                charlotte: true,
                                trigger: { global: ['dieAfter', 'washCard'] },
                                filter(event, player) {
                                    if (event.name == 'die') return event.player == game.me;
                                    return Array.from(ui.cardPile.childNodes).filter(card => card.name == 'ying').length >= 300;
                                },
                                forced: true,
                                forceDie: true,
                                async content(event, trigger, player) {
                                    player.chat('我的PR已经深入了无名杀的骨髓！');//[doge]
                                    game.over(game.me.isFriendOf(player));
                                },
                            },
                        },
                    },
                    //核心魔军
                    cxyMoJun: {
                        trigger: { global: "damageEnd" },
                        filter: function (event, player) {
                            if (!event.source || !event.source.isAlive()) return false;
                            if (get.attitude(player, event.source) < 2) return false;
                            if (!event.card || event.card.name != "sha") return false;
                            return event.notLink();
                        },
                        forced: true,
                        content: function () {
                            'step 0'
                            trigger.source.judge(function (card) {
                                return get.color(card) == 'black' ? 2 : 0;
                            });
                            'step 1'
                            if (result.bool) {
                                event.targets = game.filterPlayer(function (current) {
                                    return get.attitude(player, current) > 0;
                                });
                                event.targets.sort(lib.sort.seat);
                                game.asyncDraw(event.targets);
                            }
                        },
                    },
                    cxyJieLve: {
                        trigger: { source: "damageEnd" },
                        filter: function (event, player) {
                            if (!event.player.isAlive() || event.player == player) return false;
                            return event.player.num("hej") > 0;
                        },
                        logTarget: "player",
                        forced: true,
                        content: function () {
                            "step 0"
                            var num = 0;
                            if (trigger.player.num("h")) num++;
                            if (trigger.player.num("e")) num++;
                            if (trigger.player.num("j")) num++;
                            if (num) {
                                player.gainPlayerCard(trigger.player, "hej", num, true).set("filterButton", function (button) {
                                    for (var i = 0; i < ui.selected.buttons.length; i++) {
                                        if (get.position(button.link) == get.position(ui.selected.buttons[i].link)) return false;
                                    }
                                    return true;
                                });
                            } else {
                                event.finish();
                            }
                            "step 1"
                            player.loseHp();
                        },
                    },
                    cxyTunJun: {
                        trigger: { global: "roundStart" },
                        filter: function (event, player) {
                            return player.maxHp != 1;
                        },
                        forced: true,
                        content: function () {
                            "step 0"
                            player.loseMaxHp();
                            "step 1"
                            player.draw(player.maxHp);
                        },
                    },
                    cxyFanGong: {
                        trigger: { target: "useCardToAfter" },
                        filter: function (event, player) {
                            return get.attitude(player, event.player) < 0;
                        },
                        direct: true,
                        content: function () {
                            player.chooseToUse("是否发动反攻，对" + get.translation(trigger.player) + "使用一张[杀]？", { name: "sha" }).set("filterTarget", function (card, player, target) {
                                return target == _status.event.source;
                            }).set("selectTarget", -1).set('source', trigger.player).set("logSkill", "cxyFanGong");
                        },
                    },
                    cxyJiaoXia: {
                        trigger: { global: "phaseDiscardBefore" },
                        filter: function (event, player) {
                            return get.attitude(player, event.player) > 2;
                        },
                        forced: true,
                        logTarget: 'player',
                        content: function () {
                            trigger.player.addTempSkill("cxyJiaoXia_buff", "phaseDiscardEnd");
                        },
                        subSkill: {
                            buff: {
                                mod: {
                                    maxHandcard: function (player, num) {
                                        var hs = player.getCards('h');
                                        for (var i = 0; i < hs.length; i++) {
                                            if (get.color(hs[i]) == 'black') {
                                                num++;
                                            }
                                        }
                                        return num;
                                    },
                                    cardDiscardable: function (card, player, name) {
                                        if (name == 'phaseDiscard' && get.color(card) == 'black') return false;
                                    }
                                },
                            },
                        },
                    },
                    cxyKuangXi: {
                        enable: 'phaseUse',
                        filter: function (event, player) {
                            return !player.hasSkill('cxyKuangXi_silent');
                        },
                        filterTarget: lib.filter.notMe,
                        content: function () {
                            'step 0'
                            player.loseHp();
                            target.damage('nocard');
                            'step 1'
                            if (!target.isAlive() || target.hasHistory('damage', function (evt) {
                                return evt.getParent('cxyKuangXi') == event && evt._dyinged;
                            })) player.addTempSkill('cxyKuangXi_silent');
                        },
                        ai: {
                            threaten: function (player, target) {
                                if (!game.hasPlayer(function (current) {
                                    return player.getFriends().includes(current) && current.hp <= target.hp;
                                })) return 1;
                                return 1 + target.hp / 2;
                            },
                            order: 1,
                            result: {
                                target: function (player, target) {
                                    if (player.hp + player.countCards('hs', { name: ['jiu', 'tao'] }) + game.countPlayer(function (current) {
                                        return current.hasSkill('cxyBaoYing') && !current.awakenedSkills.includes('cxyBaoYing');
                                    }) <= 0) return 0;
                                    return get.damageEffect(target, player);
                                },
                                player: 1,
                            },
                        },
                        subSkill: { silent: { charlotte: true } },
                    },
                    cxyYangWu: {
                        trigger: { player: "phaseZhunbeiBegin" },
                        direct: true,
                        content: function () {
                            "step 0"
                            event.targets = game.filterPlayer(function (current) {
                                return current != player;
                            });
                            event.targets.sort(lib.sort.seat);
                            player.logSkill("cxyYangWu", event.targets);
                            for (var i = 0; i < event.targets.length; i++) {
                                event.targets[i].damage(player);
                                game.delay();
                            }
                            "step 1"
                            player.loseHp();
                        },
                    },
                    cxyYangLie: {
                        trigger: { player: "phaseZhunbeiBegin" },
                        direct: true,
                        content: function () {
                            "step 0"
                            var targets = game.filterPlayer(function (current) {
                                return current != player;
                            }).sortBySeat();
                            player.logSkill("cxyYangLie", targets);
                            for (var i = 0; i < targets.length; i++) {
                                player.gainPlayerCard(targets[i], 'hej', true);
                                game.delay();
                            }
                            "step 1"
                            player.loseHp();
                        },
                    },
                },
                translate: {
                    cxyMoJunPack: "魔将包",
                    cxyLiJue: "李傕",
                    cxyGuoSi: "郭汜",
                    cxyZhangJi: "张济",
                    cxyFanChou: "樊稠",
                    cxyDongYue: "董越",
                    cxyNiuFuDongXie: "牛辅董翓",
                    'fd_kuangshen04': '牢狂',
                    cxyMoJun: "魔军",
                    cxyJieLve: "劫掠",
                    cxyTunJun: "屯军",
                    cxyFanGong: "反攻",
                    cxyJiaoXia: "狡黠",
                    cxyKuangXi: "狂袭",
                    cxyYangWu: "扬武",
                    cxyYangLie: "扬烈",
                    cxyJiaoXia_info: "锁定技，友方角色的黑色手牌不计入手牌上限。",
                    cxyYangWu_info: "锁定技，准备阶段开始时，你对所有其他角色造成1点伤害，然后失去1点体力。",
                    cxyYangLie_info: "锁定技，准备阶段开始时，你获得每名角色区域里的一张牌，然后失去1点体力。",
                    cxyJieLve_info: "锁定技，当你对一名其他角色造成伤害后，你获得其区域内的各一张牌，然后失去1点体力。",
                    cxyFanGong_info: "当你成为一名敌方角色使用牌的目标且该牌结算完成后，你可以对其使用一张【杀】（无距离限制）。",
                    cxyMoJun_info: "锁定技，当友方角色使用【杀】对目标角色造成伤害后，其进行判定。若判定结果为黑色，友方角色各摸一张牌。",
                    cxyTunJun_info: "锁定技，每轮游戏开始，若你的体力上限不为1，则你须扣减1点体力上限，然后摸X张牌（X为你的体力上限）。",
                    cxyKuangXi_info: "出牌阶段，你可以失去1点体力，然后对一名其他角色造成1点伤害，若其因受到此伤害而进入濒死状态，当此濒死结算结束后，此技能于此回合内无效。",
                    fd_makeBug: 'PR',
                    fd_makeBug_info: '锁定技，回合结束时，你将手牌数摸至七张，然后若你没有手牌，你结束本局游戏，否则你随机伪装你的一张手牌的花色点数，然后X须猜测其中哪一张为此伪装牌，若X猜错，你获得两张【影】，然后在牌堆中洗入20张【影】（洗入的【影】无花色且点数为114514，X为game.me，若game.me与你同阵容或game.me未存活则改为随机一名敌方角色）。',
                    fd_tequ: '特取',
                    fd_tequ_info: '你可以将一张【影】当任意基本牌或锦囊牌使用或打出。',
                    fd_guoshou: '锅首',
                    fd_guoshou_info: '锁定技。①你删除【影】进入弃牌堆销毁和洗牌不进入牌堆的机制。②所有对其他角色造成的无来源伤害或伤害来源不为你的伤害均将伤害来源改为你。③其他角色使用的所有伤害类卡牌的伤害来源改为你。④game.me阵亡后，或洗牌后牌堆中的【影】数不小于300张，你结束本局游戏。',
                },
            },
            soldierPack: {
                character: {
                    cxyHuBenJun: ["male", "qun", 5, ["cxyHuYing"], ['ext:活动萌扩/image/cxyHuBenJun.jpg']],
                    cxyBaoLveJun: ["male", "qun", 3, ["cxyBaoYing"], ['ext:活动萌扩/image/cxyBaoLveJun.jpg']],
                    cxyFengYaoJun: ["female", "qun", 3, ["cxyFengYing"], ['ext:活动萌扩/image/cxyFengYaoJun.jpg']],
                    cxyLongXiangJun: ["male", "qun", 4, ["cxyLongYing"], ['ext:活动萌扩/image/cxyLongXiangJun.jpg']],
                    cxyFeiXiongJunZuo: ["male", "qun", 4, ["cxyJingQi"], ['ext:活动萌扩/image/cxyFeiXiongJunZuo.jpg']],
                    cxyFeiXiongJunYou: ["male", "qun", 4, ["cxyRuiQi"], ['ext:活动萌扩/image/cxyFeiXiongJunYou.jpg']],
                },
                skill: {
                    cxyRuiQi: {
                        trigger: { global: "phaseDrawBegin" },
                        filter: function (event, player) {
                            return get.attitude(player, event.player) > 2;
                        },
                        logTarget: 'player',
                        forced: true,
                        content: function () {
                            trigger.num++;
                        },
                        ai: {
                            threaten: 2.5,
                        }
                    },
                    cxyHuYing: {
                        trigger: { player: "phaseUseBegin" },
                        filter: function (event, player) {
                            return game.cxyJiangLing && game.cxyJiangLing.isAlive();
                        },
                        forced: true,
                        content: function () {
                            "step 0"
                            player.chooseCard("交给一张[杀]，或失去1点体力，令从牌堆获得一张[杀]", { name: "sha" }).ai = function (card) {
                                if (player.countCards('h', { name: "sha" }) < 2) {
                                    if (player.hp <= 2) return 2;
                                    if (!game.hasPlayer(function (current) {
                                        return player.canUse({ name: "sha" }, current);
                                    })) return 2;
                                    return -1;
                                }
                                return 2;
                            };
                            "step 1"
                            if (result.bool) {
                                game.cxyJiangLing.gain(result.cards[0], player);
                                player.$give(result.cards[0], game.cxyJiangLing);
                            } else {
                                player.loseHp();
                                var card = get.cardPile("sha");
                                game.cxyJiangLing.gain(card);
                                game.cxyJiangLing.$draw(card);
                            }
                        },
                    },
                    cxyJingQi: {
                        global: 'cxyJingQi_distance',
                        ai: { threaten: 1.5 },
                        subSkill: {
                            distance: {
                                mod: {
                                    globalFrom: function (from, to, distance) {
                                        if (game.hasPlayer(function (current) {
                                            return current.hasSkill('cxyJingQi') && get.attitude(current, from) > 0 && get.attitude(current, to) < 0;
                                        })) return distance - 1;
                                    },
                                },
                            },
                        },
                    },
                    cxyBaoYing: {
                        skillAnimation: true,
                        animationColor: "fire",
                        mark: true,
                        intro: {
                            content: "limited",
                        },
                        trigger: { global: "dying" },
                        filter: function (event, player) {
                            if (player.storage.cxyBaoYing) return false;
                            return get.attitude(player, event.player) > 2;
                        },
                        logTarget: "player",
                        check: function (event, player) {
                            return event.player.hp < 1;
                        },
                        content: function () {
                            "step 0"
                            player.storage.cxyBaoYing = true;
                            player.awakenSkill("cxyBaoYing");
                            "step 1"
                            trigger.player.recover(1 - trigger.player.hp);
                        },
                    },
                    cxyFengYing: {
                        global: 'cxyFengYing_use',
                        ai: { threaten: 2.7 },
                        subSkill: {
                            use: {
                                mod: {
                                    targetEnabled: function (card, player, target) {
                                        if (game.hasPlayer(function (current) {
                                            return current.hasSkill('cxyFengYing') && get.attitude(current, target) > 0;
                                        })) {
                                            if (((get.mode() == 'identity' && get.attitude(player, target) < 0) || (get.mode() != 'identity' && target.isEnemyOf(player))) && !game.hasPlayer(function (current) {
                                                return current != target && current.hp <= target.hp;
                                            })) return false;
                                        }
                                    },
                                },
                            },
                        },
                    },
                    cxyLongYing: {
                        trigger: { player: "phaseUseBegin" },
                        filter: function (event, player) {
                            return game.cxyJiangLing && game.cxyJiangLing.isAlive() && game.cxyJiangLing.hp < game.cxyJiangLing.maxHp;
                        },
                        direct: true,
                        content: function () {
                            "step 0"
                            player.logSkill("cxyLongYing", game.cxyJiangLing);
                            player.loseHp();
                            "step 1"
                            game.cxyJiangLing.recover();
                            "step 2"
                            game.cxyJiangLing.draw();
                        },
                        ai: {
                            threaten: 2,
                        }
                    },
                },
                translate: {
                    cxyHuBenJun: "虎贲军",
                    cxyBaoLveJun: "豹掠军",
                    cxyFengYaoJun: "凤瑶军",
                    cxyLongXiangJun: "龙骧军",
                    cxyFeiXiongJunZuo: "飞熊军左",
                    cxyFeiXiongJunYou: "飞熊军右",

                    cxyRuiQi: "锐骑",
                    cxyHuYing: "虎营",
                    cxyJingQi: "精骑",
                    cxyBaoYing: "豹营",
                    cxyFengYing: "凤营",
                    cxyLongYing: "龙营",

                    cxyRuiQi_info: "锁定技，友方角色摸牌阶段额外摸一张牌",
                    cxyJingQi_info: "锁定技，友方角色计算与敌方角色距离-1。",
                    cxyBaoYing_info: "限定技，友方角色进入濒死状态时，你可以令其体力回复至1。",
                    cxyFengYing_info: "锁定技，敌方角色不能使用牌指定体力值唯一最少的友方角色。",
                    cxyLongYing_info: "锁定技，出牌阶段开始时，若将领已受伤，则你失去1点体力，然后令其回复1点体力并摸一张牌。",
                    cxyMoJun_info: "锁定技，当友方角色使用【杀】对目标角色造成伤害后，其进行判定，若结果为黑色，友方角色各摸一张牌。",
                    cxyHuYing_info: "锁定技，出牌阶段开始时，除非你将一张【杀】交给将领，否则失去1点体力，令将领随机获得牌堆中的一张【杀】。",
                },
            },
            specialPack: {
                character: {
                    cxySunJian: ["male", "qun", 6, ["cxyYingHun", "cxyPoLu"], ['ext:活动萌扩/image/cxySunJian.jpg']],
                    cxyHuaXiong: ["male", "qun", 8, ["cxyMoQu", "cxyYaoWu", "cxyMoJun"], ['ext:活动萌扩/image/cxyHuaXiong.jpg']],
                },
                skill: {
                    cxyMoQu: {
                        group: ["cxyMoQu_sub1", "cxyMoQu_sub2"],
                        subSkill: {
                            sub1: {
                                trigger: { global: "phaseEnd" },
                                filter: function (event, player) {
                                    return player.num('h') <= player.hp;
                                },
                                forced: true,
                                content: function () {
                                    player.draw(2);
                                },
                            },
                            sub2: {
                                trigger: { global: "damageEnd" },
                                filter: function (event, player) {
                                    return event.player != player && get.attitude(player, event.player) > 0;
                                },
                                forced: true,
                                content: function () {
                                    player.chooseToDiscard("魔躯：其他友方角色受到伤害后，你弃置一张牌", "he", true);
                                },
                            },
                        },
                    },
                    cxyPoLu: {
                        trigger: { global: 'die' },
                        filter: function (event, player) {
                            if (event.player == player) return true;
                            if (!player.isAlive()) return false;
                            return event.source && get.attitude(player, event.player) < 0 && get.attitude(player, event.source) > 0;
                        },
                        forced: true,
                        forceDie: true,
                        content: function () {
                            'step 0'
                            if (player.storage.cxyPoLu == undefined) player.storage.cxyPoLu = 0;
                            player.storage.cxyPoLu++;
                            var targets = game.filterPlayer(function (target) {
                                return get.attitude(player, target) > 0;
                            }).sortBySeat();
                            event.targets = targets;
                            'step 1'
                            player.line(targets);
                            game.asyncDraw(targets, player.storage.cxyPoLu);
                        },
                        ai: {
                            //优先攻击孙坚
                            threaten: 80,
                        },
                    },
                    cxyYaoWu: {
                        trigger: { player: "damageBegin" },
                        filter: function (event, player) {
                            if (!event.source || !event.source.isAlive()) return false;
                            return event.card && event.card.name == "sha" && get.color(event.card) == "red";
                        },
                        forced: true,
                        content: function () {
                            "step 0"
                            if (trigger.source.hp == trigger.source.maxHp) {
                                trigger.source.draw();
                                event.finish();
                            } else {
                                trigger.source.chooseControl("回血", "摸牌", function (event, player) {
                                    return "回血";
                                }).prompt = "耀武：请选择回血或摸牌";
                            }
                            "step 1"
                            if (result.control == "回血") {
                                trigger.source.recover();
                            } else {
                                trigger.source.draw();
                            }
                        },
                    },
                    cxyYingHun: {
                        trigger: { player: "phaseZhunbeiBegin" },
                        filter: function (event, player) {
                            return player.hp < player.maxHp;
                        },
                        direct: true,
                        content: function () {
                            "step 0"
                            player.chooseTarget("是否发动英魂？", function (card, player, target) {
                                return target != player;
                            }).ai = function (target) {
                                if (get.attitude(player, target) > 2) return 5 + Math.random();
                                var draw = player.maxHp - player.hp;
                                var num = target.num('he') + 1;
                                if (num == draw) return 4;
                                if (num < draw) return Math.min(1, 4 - (draw - num));
                                return Math.min(1, 4 - (draw - num) * 0.5);
                            };
                            "step 1"
                            if (result.bool) {
                                event.num = player.maxHp - player.hp;
                                event.target = result.targets[0];
                                event.list = ["摸" + event.num + "弃1", "摸1弃" + event.num];
                                player.chooseControl(event.list, function (event, player) {
                                    if (get.attitude(player, event.target) > 0) return event.list[0];
                                    return event.list[1];
                                }).prompt = "英魂：请选择一项";
                            } else {
                                event.finish();
                            }
                            "step 2"
                            player.logSkill("cxyYingHun", event.target);
                            if (result.control == event.list[0]) {
                                event.target.draw(event.num);
                                event.num = 1;
                            } else {
                                event.target.draw(1);
                            }
                            "step 3"
                            event.target.chooseToDiscard("英魂：请弃置" + event.num + "张牌", event.num, "he", true);
                        },
                        ai: {
                            //优先攻击孙坚
                            threaten: 80,
                        },
                    },
                },
                translate: {
                    cxySunJian: "孙坚",
                    cxyHuaXiong: "华雄",
                    cxyMoQu: "魔躯",
                    cxyPoLu: "破掳",
                    cxyMoJun: "魔军",
                    cxyYaoWu: "耀武",
                    cxyYingHun: "英魂",
                    cxyYaoWu_info: "锁定技，当一名角色使用红色【杀】对你造成伤害时，该角色可以回复1点体力或摸一张牌。",
                    cxyPoLu_info: "锁定技，友方角色杀死一名敌方角色或你死亡时，你令友方角色各摸X张牌（X为此技能发动的次数）。",
                    cxyMoJun_info: "锁定技，当友方角色使用【杀】对目标角色造成伤害后，其进行判定，若结果为黑色，友方角色各摸一张牌。",
                    cxyMoQu_info: "锁定技，每名角色的回合结束时，若你的手牌数不大于当前体力值，你摸两张牌；其他友方角色受到伤害后，你弃置一张牌。",
                    cxyYingHun_info: "准备阶段，若你已受伤，你可以选择一名其他角色并选择一项：1.令其摸X张牌，然后弃置一张牌；2.令其摸一张牌，然后弃置X张牌。（X为你已损失的体力值）",
                },
            },
        };
        game.playerBySeat = function (seat) {
            return game.filterPlayer(function (current) {
                return current.cxySeatNumber == seat;
            })[0];
        };
        game.addCharacterPack(pack.mojunPack, "魔将包");
        game.addCharacterPack(pack.soldierPack, "魔军包");
        game.addCharacterPack(pack.specialPack, "特殊包");
        lib.translate.cxyMengJun = '盟 ';
        lib.translate.cxyMengJun2 = '盟军';
        lib.translate.cxySuiCong = '卒 ';
        lib.translate.cxySuiCong2 = '随从';
        lib.translate.cxyJiangLing = '将 ';
        lib.translate.cxyJiangLing2 = '将领';
        lib.skill._cxyJiangLingPhaseBegin = {
            ruleSkill: true,
            trigger: { global: "phaseBegin" },
            filter: function (event, player) {
                if (_status.cxyCPState != "special") return false;
                return event.player == player && player == game.cxyJiangLing;
            },
            direct: true,
            content: function () {
                "step 0"
                event.targets = game.filterPlayer(function (current) {
                    return game.cxyAis.includes(current) && current.name != "cxySunJian" && current.hp != 1;
                });
                event.targets.sort(lib.sort.seat);
                "step 1"
                for (var i = 0; i < event.targets.length; i++) {
                    event.targets[i].loseHp();
                }
            },
        };
        game.checkpoint = [
            ["cxyZhangJi", "cxyLongXiangJun", "cxyLongXiangJun"],
            ["cxyFanChou", "cxyHuBenJun", "cxyHuBenJun"],
            ["cxyNiuFuDongXie", "cxyFengYaoJun", "cxyFengYaoJun"],
            ["cxyDongYue", "cxyBaoLveJun", "cxyBaoLveJun"],
            ["cxyLiJue", "cxyFeiXiongJunZuo", "cxyFeiXiongJunYou"],
            ["cxyGuoSi", "cxyFeiXiongJunYou", "cxyFeiXiongJunZuo"],
        ];
    },
    content: {
        playerNumber: _status.cxyCPState == "normal" ? 5 : 8,
        chooseCharacterBefore: function () {
            lib.element.player.$dieAfter = function () {
                if (_status.video) return;
                if (!this.node.dieidentity) {
                    var str;
                    var node = ui.create.div('.damage.dieidentity', "阵亡", this);
                    ui.refresh(node);
                    node.style.opacity = 1;
                    this.node.dieidentity = node;
                }
            };
            lib.element.player.dieAfter = function (source) {
                if (this.identity == "cxyJiangLing") game.over(true);
                if (this.identity == "cxyMengJun") {
                    if (get.population("cxyMengJun") == 0) game.over(false);
                    if (source.identity != "cxyMengJun") {
                        var targets = game.filterPlayer(function (current) {
                            return current.identity == "cxyMengJun";
                        });
                        targets.sort(lib.sort.seat);
                        game.asyncDraw(targets, 3);
                    }
                }
            };
            //确定是否为特殊关卡，默认不是
            //调整玩家数量
            var playerNum = _status.cxyCPState == 'normal' ? 5 : 8;
            var playerCount = game.players.length;
            if (playerCount < playerNum) {
                for (var i = 0; i < playerNum - playerCount; i++) {
                    game.addPlayer();
                }
            } else if (playerCount > playerNum) {
                for (var i = 0; i < playerCount - playerNum; i++) {
                    game.removePlayer(game.players[game.players.length - 1]);
                }
            }

            for (var i = 0; i < game.players.length; i++) {
                game.players[i].logAi = function () { };
                game.players[i].dieAfter = lib.element.player.dieAfter;
                game.players[i].getFriends = function (func) {
                    var player = this;
                    var targets;
                    var self = false;
                    if (func === true) {
                        func = null;
                        self = true;
                    }
                    switch (player.identity) {
                        case 'cxyMengJun':
                            targets = game.filterPlayer(function (current) {
                                if (current == player && !self) return false;
                                return current.identity == 'cxyMengJun';
                            });
                            break;
                        case 'cxyJiangLing': case 'cxySuiCong':
                            targets = game.filterPlayer(function (current) {
                                if (current == player && !self) return false;
                                return current.identity == 'cxyJiangLing' || current.identity == 'cxySuiCong';
                            });
                            break;
                    }
                    return targets;
                };
                game.players[i].isFriendOf = function (player) {
                    return this.getFriends(true).includes(player);
                };
                game.players[i].getEnemies = function (func) {
                    var player = this;
                    var targets;
                    switch (player.identity) {
                        case 'cxyMengJun':
                            targets = game.filterPlayer(function (current) {
                                return current.identity == 'cxyJiangLing' || current.identity == 'cxySuiCong';
                            });
                            break;
                        case 'cxyJiangLing': case 'cxySuiCong':
                            targets = game.filterPlayer(function (current) {
                                return current.identity == 'cxyMengJun';
                            });
                            break;
                    }
                    return targets;
                };
                game.players[i].isEnemyOf = function (player) {
                    return this.getEnemies(true).includes(player);
                };
            }

            //分配座位
            if (_status.cxyCPState == 'normal') {
                //五人局，1、2位固定为盟军，3、5位固定为随从，4位固定为将领
                var seats = [[1, 2, 3, 4, 5], [2, 3, 4, 5, 1]];
                var seat = seats.randomGet();
                game.cxyAis = [];
                game.cxyJiangLing = null;
                for (var i = 0; i < game.players.length; i++) {
                    game.players[i].cxySeatNumber = seat[i];
                    game.players[i].setSeatNum(game.players[i].cxySeatNumber);
                    game.players[i].setNickname(get.cnNumber(game.players[i].cxySeatNumber, true) + '号位');
                    if (seat[i] == 3 || seat[i] == 4 || seat[i] == 5) {
                        game.cxyAis.push(game.players[i]);
                    }
                    if (seat[i] == 4) {
                        game.cxyJiangLing = game.players[i];
                    }
                }
            } else {
                //八人局，1、5位盟军，3位固定孙坚（盟军），2、4、6、8位随从，7位固定华雄
                var seats = [
                    [1, 2, 3, 4, 5, 6, 7, 8],
                    [5, 6, 7, 8, 1, 2, 3, 4],
                ];
                var seat = seats.randomGet();
                game.cxyAis = [];
                game.cxyJiangLing = null;
                for (var i = 0; i < game.players.length; i++) {
                    game.players[i].cxySeatNumber = seat[i];
                    game.players[i].setSeatNum(game.players[i].cxySeatNumber);
                    game.players[i].setNickname(get.cnNumber(game.players[i].cxySeatNumber, true) + '号位');
                    if (seat[i] == 3 || seat[i] == 2 || seat[i] == 4 || seat[i] == 6 || seat[i] == 8 || seat[i] == 7) {
                        game.cxyAis.push(game.players[i]);
                    }
                    if (seat[i] == 7) {
                        game.cxyJiangLing = game.players[i];
                    }
                }
            }
            game.gameDraw = function (begin) {
                var next = game.createEvent('gameDraw');
                next.begin = begin;
                next.setContent(function () {
                    "step 0"
                    var target = event.begin;
                    while (true) {
                        var num = target.identity == "cxyMengJun" ? 5 : 4;
                        target.directgain(get.cards(num));
                        target = target.next;
                        if (target == event.begin) break;
                    }
                    game.me.chooseBool("可以更换一次手牌，是否更换？");
                    "step 1"
                    if (result.bool) {
                        var hs = game.me.getCards('h');
                        game.addVideo('lose', game.me, [get.cardsInfo(hs), [], []]);
                        for (var i = 0; i < hs.length; i++) {
                            hs[i].discard(false);
                        }
                        game.me.directgain(get.cards(hs.length));
                    }
                });
            };

            get.attitude = function (from, to) {
                if (from == to) return 10;
                if (from.identity == "cxyMengJun") {
                    if (to.identity == "cxyMengJun") return 8;
                    if (to.identity == "cxySuiCong") return -6;
                    if (to.identity == "cxyJiangLing") return -10;
                    return 0;
                }
                if (from.identity == "cxySuiCong") {
                    if (to.identity == "cxyMengJun") return -10;
                    if (to.identity == "cxySuiCong") return 6;
                    if (to.identity == "cxyJiangLing") return 10;
                    return 0;
                }
                if (from.identity == "cxyJiangLing") {
                    if (to.identity == "cxyMengJun") return -10;
                    if (to.identity == "cxySuiCong") return 6;
                    if (to.identity == "cxyJiangLing") return 10;
                    return 0;
                }
            };

            game.chooseCharacter = function () {
                var next = game.createEvent("chooseCharacter", false);
                var sixPlayer = function () {
                    "step 0"
                    ui.arena.classList.add('choose-character');
                    //盟军选将范围与禁将
                    var randomCP = game.checkpoint.randomGet();
                    if (Math.random() < 0.2 && game.isInSpringFestival()) {
                        randomCP[0] = 'fd_kuangshen04';
                        lib.onover.push(bool => {
                            if (bool) {
                                const num = 114514;
                                game.bolSay('恭喜击败bug制造者牢狂，获得' + num + '萌币，祝无名杀在新的一年蒸蒸日上');
                                game.saveConfig('extension_活动萌扩_decade_Coin', lib.config.extension_活动萌扩_decade_Coin + num);
                            }
                        });
                    }
                    var cxyJiangLing = randomCP.shift();
                    var list = _status.characterlist.slice();
                    var list1 = [], list2 = [];
                    list1 = list.randomRemove(6);
                    list2 = list.randomRemove(6);
                    //分配身份
                    game.playerBySeat(1).identity = "cxyMengJun";
                    game.playerBySeat(2).identity = "cxyMengJun";
                    game.playerBySeat(3).identity = "cxySuiCong";
                    game.playerBySeat(4).identity = "cxyJiangLing";
                    game.playerBySeat(5).identity = "cxySuiCong";
                    game.showIdentity(true);
                    game.zhu = _status.firstAct = game.playerBySeat(1);
                    //Ai选将
                    for (var i = 0; i < game.cxyAis.length; i++) {
                        if (game.cxyAis[i] == game.cxyJiangLing) game.cxyAis[i].init(cxyJiangLing);
                        else game.cxyAis[i].init(randomCP.shift());
                    }
                    //我选将
                    var dialog = ui.create.dialog("选将阶段", "hidden");
                    dialog.add("我的武将列表");
                    dialog.add([list1, 'characterx']);
                    dialog.add("队友的武将列表");
                    dialog.add([list2, 'character']);
                    game.resume();
                    game.me.chooseButton(dialog, true).set('filterButton', function (button) {
                        return !_status.event.list.includes(button.link);
                    }).set('onfree', true).set('list', list2);
                    event.list = list2;
                    "step 1"
                    var getNum = function (name) {
                        var num = 0;
                        if (name == 'litong') num = 1;
                        else switch (game.getRarity(name)) {
                            case 'junk': num = 1; break;
                            case 'rare': num = 2; break;
                            case 'epic': num = 3; break;
                            case 'legend': num = 4; break;
                        }
                        return num;
                    };
                    var getCharacter = function (list) {
                        var listx = [], num = 0;
                        for (var name of list) {
                            var numx = getNum(name);
                            if (numx > num) {
                                num = numx;
                                listx = [name];
                            }
                            else if (numx == num) listx.push(name);
                        }
                        return listx;
                    };
                    game.me.init(result.links[0]);
                    game.addRecentCharacter(game.me.name, game.me.name2);
                    var target = game.me.cxySeatNumber == 1 ? game.playerBySeat(2) : game.playerBySeat(1);
                    target.init(getCharacter(event.list).randomGet());
                    if (game.cxyJiangLing.name == 'fd_kuangshen04') {
                        game.me.maxHp = game.me.maxHp * 3;
                        game.me.hp = game.me.hp * 3;
                        target.maxHp = target.maxHp * 3;
                        target.hp = target.hp * 3;
                        game.me.update();
                        target.update();
                    }
                    setTimeout(function () {
                        ui.arena.classList.remove('choose-character');
                    }, 500);
                };
                var eightPlayer = function () {
                    "step 0"
                    ui.arena.classList.add('choose-character');
                    //预处理 
                    for (var i in lib.characterPack["mode_extension_魔军包"]) {
                        lib.character[i][2]--;
                    }
                    //确定选将列表
                    var suiCongList = ["cxyHuBenJun", "cxyLongXiangJun", "cxyBaoLveJun", "cxyFengYaoJun", "cxyFeiXiongJunZuo", "cxyFeiXiongJunYou"];
                    var rmList = ["cxyFengYaoJun", "cxyFeiXiongJunZuo"];
                    suiCongList.randomSort();
                    //盟军选将范围与禁将
                    var list = _status.characterlist.slice();
                    var list1 = [], list2 = [];
                    list1 = list.randomRemove(6);
                    list2 = list.randomRemove(6);
                    //分配身份
                    //八人局，1、5位盟军，3位固定孙坚（盟军），2、4、6、8位随从，7位固定华雄
                    game.playerBySeat(1).identity = "cxyMengJun";
                    game.playerBySeat(2).identity = "cxySuiCong";
                    game.playerBySeat(3).identity = "cxyMengJun";
                    game.playerBySeat(4).identity = "cxySuiCong";
                    game.playerBySeat(5).identity = "cxyMengJun";
                    game.playerBySeat(6).identity = "cxySuiCong";
                    game.playerBySeat(7).identity = "cxyJiangLing";
                    game.playerBySeat(8).identity = "cxySuiCong";
                    game.showIdentity(true);
                    game.zhu = _status.firstAct = game.playerBySeat(1);
                    //Ai选将
                    const goon = (Math.random() < 0.35 && game.isInSpringFestival());
                    if (goon) {
                        lib.onover.push(bool => {
                            if (bool) {
                                const num = 114514;
                                game.bolSay('恭喜击败bug制造者牢狂，获得' + num + '萌币，祝无名杀在新的一年蒸蒸日上');
                                game.saveConfig('extension_活动萌扩_decade_Coin', lib.config.extension_活动萌扩_decade_Coin + num);
                            }
                        });
                    }
                    for (var i = 0; i < game.cxyAis.length; i++) {
                        if (game.cxyAis[i] == game.cxyJiangLing) game.cxyAis[i].init(goon ? 'fd_kuangshen04' : "cxyHuaXiong");
                        else if (game.cxyAis[i].cxySeatNumber == 3) game.cxyAis[i].init("cxySunJian");
                        else game.cxyAis[i].init(suiCongList.shift());
                    }
                    //我选将
                    var dialog = ui.create.dialog("选将阶段", "hidden");
                    dialog.add("我的武将列表");
                    dialog.add([list1, 'characterx']);
                    dialog.add("队友的武将列表");
                    dialog.add([list2, 'character']);
                    game.resume();
                    game.me.chooseButton(dialog, true).set('filterButton', function (button) {
                        return !_status.event.list.includes(button.link);
                    }).set('onfree', true).set('list', list2);
                    event.list = list2;
                    "step 1"
                    var getNum = function (name) {
                        var num = 0;
                        if (name == 'litong') num = 1;
                        else switch (game.getRarity(name)) {
                            case 'junk': num = 1; break;
                            case 'rare': num = 2; break;
                            case 'epic': num = 3; break;
                            case 'legend': num = 4; break;
                        }
                        return num;
                    };
                    var getCharacter = function (list) {
                        var listx = [], num = 0;
                        for (var name of list) {
                            var numx = getNum(name);
                            if (numx > num) {
                                num = numx;
                                listx = [name];
                            }
                            else if (numx == num) listx.push(name);
                        }
                        return listx;
                    };
                    game.me.init(result.links[0]);
                    game.addRecentCharacter(game.me.name, game.me.name2);
                    var target = game.me.cxySeatNumber == 1 ? game.playerBySeat(5) : game.playerBySeat(1);
                    target.init(getCharacter(event.list).randomGet());
                    if (game.cxyJiangLing.name == 'fd_kuangshen04') {
                        game.me.maxHp = game.me.maxHp * 3;
                        game.me.hp = game.me.hp * 3;
                        target.maxHp = target.maxHp * 3;
                        target.hp = target.hp * 3;
                        game.me.update();
                        target.update();
                    }
                    setTimeout(function () {
                        ui.arena.classList.remove('choose-character');
                    }, 500);
                };
                next.ai = function (player, character) {
                    player.init(character);
                };
                next.setContent(_status.cxyCPState == "normal" ? sixPlayer : eightPlayer);
            };
        },
        gameStart: function () {
            ui.cxyButton = ui.create.system("投降", function () {
                if (get.population("cxyMengJun") != 1) return;
                game.over(false);
            }, true);
            lib.setPopped(ui.cxyButton, function () {
                var dialog = ui.create.dialog("hidden");
                dialog.addText("<p align=left>本方角色只剩一人时才可投降");
                return dialog;
            }, 200);
        },
    },
};

export default brawl;