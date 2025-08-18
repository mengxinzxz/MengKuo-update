import { lib, game, ui, get, ai, _status } from '../../../../noname.js';

const brawl = {
    name: '<span style="font-size:22px;">超级斗地主</span>',
    mode: 'identity',
    intro: [
        '本模式同“新斗地主”模式',
        '本模式基础倍数为“新斗地主”模式的两倍，所有角色初始手牌为10张',
        '地主【飞扬】技能调整：锁定技，你的摸牌阶段的额定摸牌数为5，出牌阶段使用【杀】的额定次数+4。',
        '其他所有规则同十周年斗地主',
    ],
    init: function () {
        lib.element.content.gameDraw = function () {
            'step 0'
            for (var i of game.players) i.directgain(get.cards(10));
            event.count = 5;
            'step 1'
            game.me.chooseBool('是否置换手牌？', '还可置换' + event.count + '次手牌');
            'step 2'
            event.count--;
            if (result.bool) {
                var hs = game.me.getCards('h')
                for (var i = 0; i < hs.length; i++) {
                    hs[i].discard(false);
                }
                var cards = get.cards(hs.length);
                game.me._start_cards = cards;
                game.me.directgain(cards);
            }
            else event.finish();
            'step 3'
            if (event.count > 0) event.goto(1);
        };
        lib.configOL.number = 3;
        lib.config.mode_config.identity.double_character = false;
        lib.skill.decade_feiyang = {
            charlotte: true,
            trigger: { player: 'phaseJudgeBegin' },
            filter: function (event, player) {
                return player.countCards('j') && player.countCards('h') >= 2;
            },
            direct: true,
            content: function () {
                'step 0'
                player.chooseToDiscard(get.prompt2('decade_bahu'), 2).set('ai', function (card) {
                    return 6 - get.value(card);
                }).set('logSkill', 'decade_feiyang');
                'step 1'
                if (result.bool) player.discard(player.getCards('j'));
            },
        };
        lib.skill.decade_bahu = {
            charlotte: true,
            mod: {
                cardUsable: function (card, player, num) {
                    if (card.name == 'sha') return num + 4;
                },
            },
            trigger: { player: 'phaseDrawBegin' },
            filter: function (event, player) {
                return !event.numFixed;
            },
            forced: true,
            content: function () {
                trigger.num = 5;
                trigger.numFixed = true;
            },
        };
        lib.skill._decade_dizhu = {
            charlotte: true,
            ruleSkill: true,
            trigger: { global: 'gameDrawEnd' },
            direct: true,
            priority: 1 + 1 + 1,
            firstDo: true,
            content: function () {
                'step 0'
                player.chooseBool('是否明牌？', '令本局游戏的倍数翻' + (game.zhu == player ? '1' : '0.5') + '倍').set('choice', Math.random() < 0.4);
                'step 1'
                player.chooseED = true;
                if (result.bool) {
                    player.chat('明牌');
                    game.log(player, '选择', '#g明牌');
                    player.addSkill('decade_dizhu_mingpai');
                    game.decade_doudizhu += (game.zhu == player ? 1 : 0.5);
                }
                else {
                    player.chat('不明牌');
                    game.log(player, '选择', '#y不明牌');
                }
                'step 2'
                game.delay(1.5);
                if (!game.hasPlayer(function (current) {
                    return !current.chooseED;
                })) {
                    for (var i of game.players) delete i.chooseED;
                    if (game.decade_doudizhu == 1) game.log('本局没有额外加倍');
                    else {
                        game.log('本局斗地主倍数翻' + game.decade_doudizhu + '倍');
                        game.max_beishu = game.max_beishu * game.decade_doudizhu;
                        game.broadcastAll(function () {
                            if (ui.decade_ddzInfo) ui.decade_ddzInfo.innerHTML = '本局倍数：' + game.max_beishu * 100;
                        });
                    }
                }
            },
        };
        lib.skill.decade_dizhu_mingpai = {
            charlotte: true,
            global: 'decade_dizhu_mingpai_mingpai',
            mark: true,
            marktext: '牌',
            intro: {
                mark: function (dialog, content, player) {
                    var hs = player.getCards('h');
                    if (hs.length) {
                        dialog.addText('明牌勇气可嘉，胜负代价更高！本局游戏倍数翻倍！');
                        dialog.addSmall(hs);
                    }
                    else dialog.addText('无手牌');
                },
                content: function (content, player) {
                    var hs = player.getCards('h');
                    if (hs.length) return get.translation(hs);
                    else return '无手牌';
                },
            },
            subSkill: {
                mingpai: {
                    ai: {
                        viewHandcard: true,
                        skillTagFilter: function (player, arg, target) {
                            return target != player && target.hasSkill('decade_dizhu_mingpai');
                        },
                    },
                },
            },
        };
        lib.skill._decade_doudizhu_view = {
            ai: {
                viewHandcard: true,
                skillTagFilter: function (player, arg, target) {
                    return target != player && target.identity == player.identity;
                },
            },
        };
        lib.translate.decade_feiyang = '飞扬';
        lib.translate.decade_feiyang_info = '锁定技，你的摸牌阶段的额定摸牌数为5，出牌阶段使用【杀】的额定次数+4。';
        lib.translate.decade_bahu = '跋扈';
        lib.translate.decade_bahu_info = '判定阶段开始时，你可以弃置两张手牌并弃置判定区所有牌。';
        lib.translate.decade_dizhu_mingpai = '明牌';
    },
    content: {
        submode: 'normal',
        chooseCharacterBefore: function () {
            //开启闪连
            if (lib.config.extension_活动萌扩_decade_shanlian) {
                lib.skill.decade_shanlian = {
                    charlotte: true,
                    trigger: { player: 'gainAfter', global: 'loseAsyncAfter' },
                    filter: function (event, player) {
                        return event.getg(player).some(card => card.name == 'shan');
                    },
                    forced: true,
                    content: function () {
                        player.draw();
                    },
                };
                lib.translate.decade_shanlian = '闪连';
                game.addGlobalSkill('decade_shanlian');
                const showShanLianEvent = function () {
                    if (ui.ShanLianEvent) return;
                    ui.ShanLianEvent = ui.create.system('闪连', null, true);
                    lib.setPopped(ui.ShanLianEvent, function () {
                        var uiintro = ui.create.dialog('hidden');
                        uiintro.add('全局技能【闪连】已生效');
                        const info = '锁定技，当你获得【闪】后，你摸一张牌。';
                        uiintro.add('<div class="text center">' + info + '</div>');
                        var ul = uiintro.querySelector('ul');
                        if (ul) ul.style.width = '180px';
                        uiintro.add(ui.create.div('.placeholder'));
                        return uiintro;
                    }, 250);
                };
                showShanLianEvent();
            }
            //选将加载
            if (!_status.characterlist) lib.skill.pingjian.initList();
            _status.HDcharacterlist = _status.characterlist.slice();
            if (lib.config.extension_活动萌扩_use_DDZname) {
                var map = lib.config.extension_活动萌扩_DDZname || [
                    'shen_zhaoyun', 'shen_ganning', 'liuyan', 'xizhicai', 're_wuyi', 'xin_lingtong', 'zhoushan', 'chengui',
                    'dc_liuye', 'dc_tengfanglan', 'shen_machao', 'shen_zhangfei', 'shen_zhangjiao', 'shen_dengai', 're_liuzan', 'caojinyu',
                    're_sunyi', 'caomao', 'xushao', 'zhujianping', 'tenggongzhu', 'zhangxuan', 'dc_zhouxuān', 'zerong',
                    'dc_luotong', 'ruanji', 'dc_xujing', 'xuelingyun', 'yue_caiwenji', 'star_caoren'
                ];
                _status.HDcharacterlist = _status.HDcharacterlist.filter(name => map.includes(name));
            }
            if (!game.decade_doudizhu) game.decade_doudizhu = 1;
            game.decadeDouDiZhu = {
                hasZhuSkill: () => false,
                $dieAfter: function () {
                    if (_status.video) return;
                    if (!this.node.dieidentity) {
                        var str = { zhu: '地主', fan: '农民' }[this.identity];
                        var node = ui.create.div('.damage.dieidentity', str, this);
                        ui.refresh(node);
                        node.style.opacity = 1;
                        this.node.dieidentity = node;
                    }
                    var trans = this.style.transform;
                    if (trans) {
                        if (trans.indexOf('rotateY') != -1) {
                            this.node.dieidentity.style.transform = 'rotateY(180deg)';
                        }
                        else if (trans.indexOf('rotateX') != -1) {
                            this.node.dieidentity.style.transform = 'rotateX(180deg)';
                        }
                        else {
                            this.node.dieidentity.style.transform = '';
                        }
                    }
                    else {
                        this.node.dieidentity.style.transform = '';
                    }
                },
                dieAfter: function () {
                    game.checkResult();
                },
                dieAfter2: function () {
                    if (this.identity != 'fan') return;
                    var player = this, target = game.findPlayer(function (current) {
                        return current != player && current.identity == 'fan';
                    });
                    if (target && target == game.me) {
                        ui.create.system('投降', function () {
                            game.log(game.me, '投降');
                            game.over(false);
                        }, true);
                    }
                },
            };
            for (var i in game.decadeDouDiZhu) lib.element.player[i] = game.decadeDouDiZhu[i];
            for (var i of game.players) {
                for (var j in game.decadeDouDiZhu) i[j] = game.decadeDouDiZhu[j];
                i.identity = 'cai';
                i.setIdentity();
                i.identityShown = true;
            }
            //设置态度值
            get.attitude = function (from, to) {
                if (from.identity == to.identity) return 10;
                return -10;
            };
            get.rawAttitude = function (from, to) {
                if (from.identity == to.identity) return 10;
                return -10;
            };
            game.showIdentity(true);
            game.checkResult = function () {
                if (!game.zhu.isAlive() || !game.players.some(function (current) {
                    return current.identity == 'fan';
                })) game.over((!game.zhu.isAlive() && game.me.identity == 'fan') || !game.players.some(function (current) {
                    return current.identity == 'fan';
                }) && game.me.identity == 'zhu');
            };
            game.broadcastAll(function () {
                if (get.is.phoneLayout()) ui.decade_ddzInfo = ui.create.div('.touchinfo.left', ui.window);
                else ui.decade_ddzInfo = ui.create.div(ui.gameinfo);
                ui.decade_ddzInfo.innerHTML = '抢地主阶段';
            });
            lib.onover.push(function (bool) {
                game.saveConfig('extension_活动萌扩_decade_Coin_game', null);
                game.saveConfig('extension_活动萌扩_decade_Coin_Gaming', null);
                var num = game.max_beishu * 100 * (game.zhu == game.me ? 2 : 1);
                var numx = game.max_beishu * 100;
                if (bool == undefined) {
                    for (var i of game.filterPlayer2()) i.chat('+0');
                }
                else {
                    if (game.zhu.isAlive()) {
                        for (var i of game.filterPlayer2()) {
                            if (i == game.zhu) i.chat('+' + numx * 2);
                            else i.chat('-' + numx);
                        }
                    }
                    if (!game.zhu.isAlive()) {
                        for (var i of game.filterPlayer2()) {
                            if (i == game.zhu) i.chat('-' + numx * 2);
                            else i.chat('+' + numx);
                        }
                    }
                }
            });
            game.chooseCharacter = function () {
                var next = game.createEvent('chooseCharacter', false);
                next.showConfig = true;
                next.setContent(function () {
                    "step 0"
                    game.saveConfig('extension_活动萌扩_decade_Coin_Gaming', 200);
                    ui.arena.classList.add('choose-character');
                    for (var i of game.players) {
                        i.characterlist = _status.HDcharacterlist.randomRemove(5);
                        var content = ['你的初始武将', [i.characterlist, 'character']];
                        i.chooseControl('ok').set('dialog', content);
                    }
                    var target = game.players.randomGet();
                    event.control = ['一倍', '两倍', '三倍', '不叫'];
                    event.target = target;
                    event.beginner = target;
                    "step 1"
                    var control = event.control;
                    target.chooseControl(control).set('ai', function () {
                        return control.randomGet();
                    }).set('prompt', '是否' + (control.length == 4 ? '叫' : '抢') + '地主？');
                    "step 2"
                    var getBeiShu = function (control) {
                        switch (control) {
                            case '一倍': return 1; break;
                            case '两倍': return 2; break;
                            case '三倍': return 3; break;
                            case '不叫': return 0; break;
                        }
                    };
                    target.chat(result.control);
                    var num = event.control.indexOf(result.control);
                    target.max_beishu = getBeiShu(result.control);
                    game.saveConfig('extension_活动萌扩_decade_Coin_Gaming', target.max_beishu * 100);
                    if (result.control == '三倍') {
                        game.winner = target;
                        game.max_beishu = 3;
                    }
                    else {
                        if (target.next != event.beginner) game.delay(1.5);
                        if (result.control != '不叫') {
                            var temp = [];
                            for (var i = 0; i < event.control.length; i++) {
                                if (i > num) temp.push(event.control[i]);
                            }
                            event.control = temp;
                        }
                        if (target.next == event.beginner) {
                            if (event.control.length == 4) {
                                game.winner = event.beginner;
                                game.max_beishu = 1;
                            }
                            else {
                                var winner = game.findPlayer(function (current) {
                                    return !game.hasPlayer(function (currentx) {
                                        return current.max_beishu < currentx.max_beishu;
                                    });
                                });
                                game.winner = winner;
                                game.max_beishu = winner.max_beishu;
                            }
                        }
                        else {
                            event.target = target.next;
                            event.goto(1);
                        }
                    }
                    'step 3'
                    game.max_beishu = game.max_beishu * 2;
                    game.broadcastAll(function () {
                        if (ui.decade_ddzInfo) ui.decade_ddzInfo.innerHTML = '本局倍数：' + game.max_beishu * 100;
                    });
                    game.winner.characterlist.addArray(_status.HDcharacterlist.randomRemove(2));
                    for (var i of game.players) {
                        i.identity = (game.winner == i ? 'zhu' : 'fan');
                        i.setIdentity();
                        i.identityShown = true;
                        if (i.identity == 'zhu') game.zhu = i;
                    }
                    'step 4'
                    var getNum = function (name) {
                        var num;
                        switch (game.getRarity(name)) {
                            case 'junk': num = 1; break;
                            case 'rare': num = 3; break;
                            case 'epic': num = 4; break;
                            case 'legend': num = 5; break;
                            default: num = 2; break;
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
                    var createDialog = ['请选择你的武将'];
                    if (game.me.identity == 'fan') {
                        var fellow = game.findPlayer(function (current) {
                            return current != game.me && current.identity == game.me.identity;
                        });
                        createDialog.push('<div class="text center">玩家武将</div>');
                        createDialog.push([game.me.characterlist, 'characterx']);
                        createDialog.push('<div class="text center">队友武将</div>');
                        createDialog.push([fellow.characterlist, 'character']);
                    }
                    else createDialog.push([game.me.characterlist, 'characterx']);
                    game.me.chooseButton(createDialog, true).set('onfree', true).set('filterButton', function (button) {
                        return !_status.event.list.includes(button.link);
                    }).set('ai', function (button) {
                        return getCharacter(_status.event.listx).randomGet();
                    }).set('list', fellow ? fellow.characterlist : []).set('listx', game.me.characterlist);
                    'step 5'
                    var getNum = function (name) {
                        var num;
                        switch (game.getRarity(name)) {
                            case 'junk': num = 1; break;
                            case 'rare': num = 3; break;
                            case 'epic': num = 4; break;
                            case 'legend': num = 5; break;
                            default: num = 2; break;
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
                    for (var i of game.players) {
                        if (i != game.me) i.init(getCharacter(i.characterlist).randomGet());
                    }
                    if (game.me.identity == 'zhu') {
                        ui.create.system('投降', function () {
                            game.log(game.me, '投降');
                            game.over(false);
                        }, true);
                    }
                    'step 6'
                    for (var i of game.players) {
                        delete i.characterlist;
                        delete i.max_beishu;
                        _status.characterlist.remove(i.name);
                        _status.characterlist.remove(i.name1);
                        _status.characterlist.remove(i.name2);
                    }
                    game.zhu.maxHp = game.zhu.maxHp + 1;
                    game.zhu.hp = game.zhu.hp + 1;
                    game.zhu.update();
                    game.zhu.addSkill('decade_feiyang');
                    game.zhu.addSkill('decade_bahu');
                    'step 7'
                    delete _status.HDcharacterlist;
                    setTimeout(function () {
                        ui.arena.classList.remove('choose-character');
                    }, 500);
                });
            };
        },
    },
};

export default brawl;