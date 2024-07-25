import { lib, game, ui, get, ai, _status } from '../../../../noname.js';

const brawl = {
    name: '极略武皇',
    mode: 'identity',
    intro: [
        '双方从随机十名武将（其中五名武将为暗将，仅选择方可见），双方依次抽取其中两张（第一次抽取为一张）作为自己的备选武将',
        '然后双方选择一至两名武将作为自己的武将牌，进行1v1对决，双将体力上限和体力值均为和-3',
        '一方武将阵亡后，其从自己的剩余备选武将中选择一至两名武将作为自己的武将牌继续战斗',
        '胜利条件：率先击败对方所有武将',
        '玩家方胜利后，可以选择对决强敌（？？/？？双将组合），若选择对决，无论对局是否胜利均不会影响游戏结果（即玩家胜利）',
    ],
    init: function () {
        lib.configOL.number = 2;
        lib.config.mode_config.identity.double_hp = 'hejiansan';
        lib.config.mode_config.identity.double_character = false;
    },
    content: {
        submode: 'normal',
        chooseCharacterBefore: function () {
            lib.translate.fan = '先';
            lib.translate.fan2 = '先手';
            lib.translate.zhong = '后';
            lib.translate.zhong2 = '后手';
            if (!_status.characterlist) lib.skill.pingjian.initList();
            game.bilibili_wuhuang = {
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
                    var target = this;
                    if (!_status.characterMap[game.me.identity].length || (game.wuhuangED && target == game.me.enemy)) game.checkResult();
                },
                dieAfter2: function () {
                    var next, target = this;
                    if (target == game.me || _status.characterMap[game.me.enemy.identity].length) {
                        next = game.createEvent('replacePlayerSingle', false, _status.event.getParent());
                        next.player = this;
                        next.forceDie = true;
                        next.setContent(function () {
                            'step 0'
                            game.delay();
                            'step 1'
                            var characters = _status.characterMap[player.identity];
                            player.chooseButton(true, ['请选择出场武将', [characters, 'character']], [1, Math.min(2, characters.length)]).set('forceDie', true).set('ai', () => -0.5 + Math.random());
                            'step 2'
                            var source = player;
                            var names = result.links;
                            var color = source.node.identity.dataset.color;
                            game.broadcastAll(function (player, names, color) {
                                player.revive(null, false);
                                player.uninit();
                                player.init(names[0], names[1] ? names[1] : null);
                                player.node.identity.dataset.color = color;
                            }, source, names, color);
                            game.log(source, (source.name2 ? '<span class="bluetext">/' + get.translation(source.name2) + '</span>' : ''), '出场');
                            source.draw(4);
                            var evt = event.getParent('dying');
                            if (evt && evt.parent) evt.parent.untrigger(false, source);
                            game.addVideo('reinit', source, [name, color]);
                            game.triggerEnter(source);
                            _status.characterMap[player.identity].removeArray(names);
                        });
                    }
                    else {
                        next = game.createEvent('challengeWuHuang', false, _status.event.getParent());
                        next.player = game.me;
                        next.target = target;
                        next.setContent(function () {
                            'step 0'
                            game.me.chooseBool('武皇：是否挑战强敌？', '若不挑战，则以游戏胜利结束本局游戏；若挑战，即使挑战失败，亦判定玩家游戏胜利');
                            'step 1'
                            if (result.bool) {
                                game.wuhuangED = true;
                                var names = [['guojia', 'huatuo'], ['zhenji', 'zhangjiao']].randomGet();
                                var color = target.node.identity.dataset.color;
                                game.broadcastAll(function (player, names, color) {
                                    player.revive(null, false);
                                    player.uninit();
                                    player.init(names[0], names[1]);
                                    player.node.identity.dataset.color = color;
                                }, target, names, color);
                                game.log(target, '<span class="bluetext">/' + get.translation(target.name2) + '</span>', '出场');
                                target.draw(4);
                                target.$fullscreenpop('强敌来袭', 'fire');
                                var evt = event.getParent('dying');
                                if (evt && evt.parent) evt.parent.untrigger(false, target);
                                game.addVideo('reinit', target, [name, color]);
                                game.triggerEnter(target);
                            }
                            else game.over(true);
                        });
                    }
                },
            };
            for (var i in game.bilibili_wuhuang) lib.element.player[i] = game.bilibili_wuhuang[i];
            for (var i of game.players) {
                for (var j in game.bilibili_wuhuang) i[j] = game.bilibili_wuhuang[j];
            }
            //设置态度值
            get.attitude = function (from, to) {
                return from.identity == to.identity ? 10 : -10;
            };
            get.rawAttitude = function (from, to) {
                return from.identity == to.identity ? 10 : -10;
            };
            game.showIdentity(true);
            game.checkResult = function () {
                game.over(game.wuhuangED || _status.characterMap[game.me.identity].length > 0);
            };
            game.chooseCharacter = function () {
                var next = game.createEvent('chooseCharacter', false);
                next.showConfig = true;
                next.setContent(function () {
                    "step 0"
                    ui.arena.classList.add('choose-character');
                    lib.init.onfree();
                    game.broadcastAll(function (p, t) {
                        p.enemy = t; t.enemy = p;
                    }, game.players[0], game.players[1]);
                    _status.characterMap = { 'fan': [], 'zhong': [] };
                    "step 1"
                    var identity = ['fan', 'zhong'].randomGet();
                    game.me.identity = identity;
                    game.me.enemy.identity = (identity == 'fan' ? 'zhong' : 'fan');
                    game.me.showIdentity();
                    game.me.enemy.showIdentity();
                    game.players.sortBySeat(identity == 'fan' ? game.me : game.me.enemy);
                    game.zhu = game.players[0];
                    event.turn = game.players[0];
                    "step 2"
                    var map = [];
                    var characters = _status.characterlist.randomGets(10);
                    var hiddenCharacters = characters.randomRemove(5);
                    hiddenCharacters = hiddenCharacters.map(name => {
                        if (!lib.character['bilibiliHidden_' + name]) {
                            map.add('bilibiliHidden_' + name);
                            lib.character['bilibiliHidden_' + name] = ['', '', '', [], ['ext:活动萌扩/image/unknown.jpg']];
                            lib.translate['bilibiliHidden_' + name] = '未知武将';
                        }
                        return 'bilibiliHidden_' + name;
                    });
                    event.num = 1;
                    event.map = map;
                    characters.addArray(hiddenCharacters);
                    characters.randomSort();
                    event.characters = characters;
                    'step 3'
                    var list1 = event.characters.randomGets(5);
                    var list2 = event.characters.filter(name => !list1.includes(name));
                    event.videoIdx = lib.status.videoId++;
                    game.broadcastAll(function (id, list1, list2) {
                        var dialog = ui.create.dialog('选择武将', [list1, 'character'], [list2, 'character']);
                        dialog.videoId = id;
                    }, event.videoIdx, list1, list2);
                    'step 4'
                    var numx = Math.min(2, event.num, event.characters.length);
                    event.turn.chooseButton(true, numx).set('filterButton', function (button) {
                        return _status.event.canChoose.includes(button.link);
                    }).set('onfree', numx == 1).set('dialog', event.videoIdx).set('canChoose', event.characters).set('ai', () => 1 + Math.random());
                    'step 5'
                    if (result.bool) {
                        event.num++;
                        _status.characterMap[event.turn.identity].addArray(result.links);
                        _status.characterMap[event.turn.enemy.identity].removeArray(result.links);
                        event.characters.removeArray(result.links);
                        game.broadcastAll(function (link, choosing, first, id) {
                            var dialog = get.idDialog(id);
                            if (dialog) {
                                dialog.content.firstChild.innerHTML = (choosing == game.me ? '你' : '对手') + '选择了' + get.translation(link);
                                for (var i = 0; i < dialog.buttons.length; i++) {
                                    if (link.includes(dialog.buttons[i].link)) dialog.buttons[i].classList.add(first ? 'selectedx' : 'glow');
                                }
                            }
                        }, result.links, event.turn, event.turn != game.me, event.videoIdx);
                    }
                    else event.goto(4);
                    'step 6'
                    if (event.characters.length) {
                        event.turn = event.turn.enemy;
                        event.goto(4);
                    }
                    else game.broadcastAll('closeDialog', event.videoIdx);
                    'step 7'
                    ['fan', 'zhong'].forEach(identity => {
                        _status.characterMap[identity] = _status.characterMap[identity].map(name => {
                            if (name.startsWith('bilibiliHidden_')) {
                                delete lib.character[name];
                                return name.slice('bilibiliHidden_'.length);
                            }
                            return name;
                        });
                    });
                    'step 8'
                    ['fan', 'zhong'].forEach(identity => _status.characterlist.removeArray(_status.characterMap[identity]));
                    game.me.chooseButton(true, ['请选择出场武将', [_status.characterMap[game.me.identity], 'character']], [1, 2]).set('ai', () => -0.5 + Math.random());
                    'step 9'
                    _status.characterMap[game.me.identity].removeArray(result.links);
                    game.me.init(result.links[0], result.links[1] ? result.links[1] : null);
                    game.log(game.me, (game.me.name2 ? '<span class="bluetext">/' + get.translation(game.me.name2) + '</span>' : ''), '出场');
                    'step 10'
                    game.me.enemy.chooseButton(true, ['请选择出场武将', [_status.characterMap[game.me.enemy.identity], 'character']], [1, 2]).set('ai', () => -0.5 + Math.random());
                    'step 11'
                    _status.characterMap[game.me.enemy.identity].removeArray(result.links);
                    game.me.enemy.init(result.links[0], result.links[1] ? result.links[1] : null);
                    game.log(game.me.enemy, (game.me.enemy.name2 ? '<span class="bluetext">/' + get.translation(game.me.enemy.name2) + '</span>' : ''), '出场');
                    'step 12'
                    setTimeout(() => ui.arena.classList.remove('choose-character'), 500);
                });
            };
        },
    },
};

export default brawl;