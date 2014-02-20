/**
 * Created by Administrator on 14-2-19.
 */

t.rH = function () {
	var b = Br(this), c = Cr(this);
	"toolong" === b.name || "buffer" === b.name ? (this.Ws.innerHTML = b.Ne, R(this.Ws, j)) : (this.Ws.innerHTML = b.Ne, R(this.Ws, n));
	"multiquestionmark" === c.name || "duplicatedquestion" === c.name ? Ar(this, c, j) : Ar(this, c, n);
	xr(this, 1 < c.pc, "title")
};
a.Cr = function (b) {
	var c = Dk(b.dd.value).replace(/？/g, "?"), d;
	var e = "#";
	d = b.Uo || new zr;
	var g = n;
	if (b.kC && b.IU) {
		var h = b.kC.$a;
		h && h.length ? (z.forEach(h, function (b) {
			4 < b.raw.length && 1 === +b.raw[4] && (g = j, e = "/question/" + b.url_token + "?q=" + encodeURIComponent(this.dd.value) + "&psq=0")
		}, b), g ? (d.Ne = '我们找到了一个也许是你想问的问题，<a href="' + e + '">查看问题</a>', d.pc = 3, d.name = "duplicatedquestion", d.live = j, b.Gn.href = e, R(b.cr, n), R(b.Gn, j)) : (d = new zr, R(b.cr, j), R(b.Gn, n)), b.Uo = d) : (d = new zr, b.Uo = d, R(b.cr, j), R(b.Gn, n));
		b.Uo || (b.Uo = d);
		d = b.Uo
	}
	1 <
		d.pc || (1 > Jk(Dk(b.dd.value).replace("？", "?")) ? (d.Ne = "您还没有给问题添加问号", d.pc = 3, d.name = "noquestionmark") : 1 < Jk(c) && (d.Ne = "如果有多个问题，最好拆分一下", d.pc = 1, d.name = "multiquestionmark"));
	return d
}, a.Br = function (b) {
	var b = Dk(b.dd.value).replace(/？/g, "?"), b = Rk(b), c = new zr;
	3 > b ? (c.pc = 3, c.Ne = "问题字数太少了吧", c.name = "tooshort") : 40 < b && 50 >= b ? (c.pc = 1, c.Ne = '还可以输入 <span class="warning">' + (50 - b) + "</span> 字", c.name = "buffer") : 50 < b && (c.pc = 3, c.Ne = '已超出 <span class="error">' + (b - 50) + "</span> 字", c.name = "toolong");
	return c
};
t.pH = function () {
	var b = n;
	1 > this.Sa.data.length ? (b = j, this.iB.innerHTML = "至少添加一个话题") : 5 < this.Sa.data.length && (b = j, this.iB.innerHTML = "最多添加五个话题");
	R(this.iB, b);
	xr(this, b, "topic")
};
a.Dr = function (b) {
	var b = b.Rb, c = La(b.pg());
	return b.isContentEditable() ? c : Na(c)
}, a.yr = function (b) {
	var c = new Nk, d = [], e = [];
	c.add("question_title", b.dd.value);
	c.add("question_detail", Dr(b));
	b.Ln && c.add("anon", b.Ln.checked ? "1" : "0");
	z.forEach(b.Sa.data, function (b) {
		b[3] ? d.push(b[3]) : e.push(b[1])
	});
	c.add("topic_ids", d.join(","));
	c.add("new_topics", e.join("$"));
	jh && c.add("uid", jh[3]);
	b.Ln.checked || (c.add("share_qq", Number(b.Cc.he())), c.add("share_sina", Number(b.Ec.he())));
	return c
};
t.XR = function () {
	this.Rb && sr(this.Rb)
};
a.zr = function () {
	this.pc = isNaN(i) ? 0 : i;
	this.Ne = ""
};
a.Er = function (b) {
	T.call(this);
	this.options = $.extend({stopPropagation: j, PL: "#000", xv: 0.5, BM: "#666", kD: 0.2, top: 2, width: 6, right: 2, KL: j}, b);
	this.kz = 0;
	this.Lr = n
};
y(Er, T);
t = Er.prototype;
t.ba = function (b) {
	this.g = b;
	this.O = $(this.g);
	this.O.addClass("zh-scroller").css({position: "relative", overflow: "hidden"}).wrapInner('<div class="zh-scroller-content"></div>');
	this.O.wrapInner('<div class="zh-scroller-inner"></div>');
	this.O.append("<div class='zh-scroller-bar-container'><div>");
	this.O.append('<div class="zh-scroller-bar"></div>');
	this.xe = this.O.children(".zh-scroller-inner");
	this.Yk = this.O.children(".zh-scroller-bar-container");
	this.ve = this.O.children(".zh-scroller-bar");
	this.jf = this.xe.children(".zh-scroller-content");
	this.Xq = this.ve[0];
	this.fQ = this.xe[0];
	this.content = this.jf[0];
	this.Yq = this.Yk[0];
	this.xe.css({height: "100%", width: "150%", overflow: "auto"});
	this.ve.css({position: "absolute", right: this.options.right, top: this.options.top, opacity: this.options.xv, background: this.options.PL, width: this.options.width, "border-radius": 3, cursor: "default"});
	this.Yk.css({position: "absolute", right: this.options.right - 1, top: 0, height: "100%", width: this.options.width, background: this.options.BM, border: "1px solid #444", opacity: 0, cursor: "default",
		"border-radius": "2px"});
	this.Li(this.Xq, n);
	this.Li(this.Yq, n);
	this.update()
};
t.D = function () {
	Er.n.D.call(this);
	this.oB = new mn(this.xz, 50, this);
	this.options.stopPropagation && this.xe.bind("mousewheel DOMMouseScroll", function (b) {
		var c = k;
		"mousewheel" === b.type ? c = -1 * b.originalEvent.wheelDelta : "DOMMouseScroll" === b.type && (c = 40 * b.originalEvent.detail);
		c && (b.preventDefault(), $(this).scrollTop(c + $(this).scrollTop()))
	})
};
t.qS = function (b) {
	b.target === this.Xq && (this.Lr = j, this.QL = b.clientY, this.RL = parseInt(this.ve.css("top"), 10));
	(b.target === this.Xq || b.target === this.Yq) && this.Li(document.body, n)
};
t.sS = function () {
	this.Lr = n;
	this.Li(document.body, j)
};
t.rS = function (b) {
	if (this.Lr) {
		var c = Fr(this, this.RL + (b.clientY - this.QL));
		this.xe.scrollTop(c)
	}
	this.kz = b.target === this.Xq ? 2 : b.target === this.Yq ? 1 : 0
};
a.Gr = function (b) {
	b.Vp && (b.ve.stop().css({opacity: b.options.xv}).show(), b.An && (clearTimeout(b.An), b.An = n))
}, a.Hr = function (b, c) {
	b.An = setTimeout(v(function () {
		this.ve.stop().fadeOut();
		this.An = n
	}, b), c || 0)
};
t.xz = function () {
	var b = this.xe.scrollTop(), c = this.jf.height(), d = this.xe.height(), e = b / c * (d - 2 * this.options.top);
	Gr(this);
	this.ve.css({top: e + this.options.top});
	this.dispatchEvent(new Ir(this, b, c - b - d, b / (c - d)))
};
t.update = function () {
	var b = this.Wl(this.xe).height, c = this.Wl(this.jf).height;
	b >= c ? (this.Vp = n, this.ve.hide()) : (this.Vp = j, this.ve.show());
	this.ve.css({height: b / c * (b - 2 * this.options.top)});
	this.Yk.css({height: b - 2});
	this.jf.css({overflow: "hidden", width: this.O.width(), "min-height": "100%"});
	return this
};
t.Wl = function (b) {
	var c = {height: b.height(), width: b.width()};
	if (!c.height) {
		var d = b.css("display"), e = b.css("position"), g = b.css("visibility");
		b.css({position: "absolute", display: "block", visibility: "hidden"});
		c = {height: b.height(), width: b.width()};
		b.css({position: e, display: d, visibility: g})
	}
	return c
};
t.IR = function (b) {
	this.scrollTo(Fr(this, b.offsetY - this.ve.height() / 2))
};
a.Fr = function (b, c) {
	var d = b.xe.height() - 2 * b.options.top - b.ve.height(), e = b.jf.height() - b.xe.height();
	return c / d * e
};
t.scrollTop = function (b) {
	this.Vp && (b = b || 200, Gr(this), this.xe.stop().animate({scrollTop: 0}, b));
	return this
};
t.Li = function (b, c) {
	ug(b, !c)
};
t.scrollTo = function (b) {
	this.Vp && (Gr(this), this.xe.stop().animate({scrollTop: b}, 200));
	return this
};
a.Ir = function (b, c, d, e) {
	id.call(this, "scroll", b);
	this.scrollTop = c;
	this.Y_ = d;
	this.Z_ = e
};
y(Ir, id);
a.Jr = function (b, c, d, e) {
	M.call(this);
	this.g = b;
	this.Ww = c || "people";
	this.CN = d || ["zg-btn-follow", "zg-btn-unfollow"];
	this.text = e || ["关注", "取消关注"]
};
y(Jr, ml);
Jr.prototype.B = function () {
	this.h().e(this.g, "click", this.jp)
};
Jr.prototype.jp = function (b) {
	b = Mk(this.g, b.target);
	"focus" === (b && b.name) && Qk(b, this.Ww, k, this.CN, {follow_text: this.text[0], unfollow_text: this.text[1]})
};
a.Kr = function (b) {
	T.call(this);
	this.G = $.extend({}, this.U, b || {})
};
y(Kr, T);
Kr.prototype.U = {NG: ".tab-nav", zH: ".tab-panel", dl: "active"};
Kr.prototype.ba = function (b) {
	if (b) {
		this.g = b;
		var c = this, d = this.G;
		this.bl = $(d.NG, b);
		this.TB = $(d.zH, b);
		this.Pj = this.bl.index("." + d.dl);
		this.bl.on("click", function () {
			c.select(c.bl.index(this))
		})
	}
};
Kr.prototype.select = function (b) {
	if (!(0 > b || b > this.bl.size()))if (this.dispatchEvent({type: "action", data: {index: b}}), b !== this.Pj) {
		this.Pj = b;
		var c = this.G, d = this.bl.eq(b);
		this.bl.not(d.addClass(c.dl)).removeClass(c.dl);
		c = this.TB.eq(b);
		this.TB.not(c.show()).hide();
		this.dispatchEvent({type: "select", data: {index: b}})
	}
};
Kr.prototype.index = q("Pj");
a.Lr = function () {
	M.call(this);
	this.eg = [0, 0, 0];
	this.WG = [0, 0, 0];
	this.types = ["default", "follow", "vote_thank"];
	this.Cw = j;
	this.mf = [n, n, n];
	this.Ul = [0, 0, 0];
	this.Zm = [n, n, n]
};
y(Lr, ml);
t = Lr.prototype;
t.B = function () {
	this.wrap = I("zh-top-nav-live-new");
	this.XB = $(this.wrap);
	this.wrapInner = I("zh-top-nav-live-new-inner");
	this.sr = I("zh-top-nav-count-wrap");
	this.Qn = K("span", {id: "zh-top-nav-count", className: "zu-top-nav-count zg-noti-number", style: "display:none"});
	this.contents = Xb("zm-noti7-content", this.wrap);
	this.XQ = Xb("zm-noti7-popup-refresh", this.wrap);
	this.Xv = Xb("zm-noti7-content-body", this.wrap);
	this.sr.appendChild(this.Qn);
	this.h().e(this.sr, "click", this.GV);
	this.h().e(Y, "noti7", this.XO);
	this.h().e(this.wrap,
		"click", this.ka);
	this.h().e(this.wrap, "click", function (b) {
		b = b.target;
		b.href && /group_id=/.test(b.href + "") && $(b).parent(".unread").removeClass("unread")
	});
	var b = J("zm-noti7-popup-tab-container");
	this.PG = Xb("new-noti", b);
	this.Eh = new Kr({NG: ".zm-noti7-popup-tab-item", zH: ".zm-noti7-content", dl: "current"});
	this.h().e(this.Eh, "action",function (b) {
		this.CD = b = b.data.index;
		Mr(this, b);
		var d = this.Om && this.Om[b];
		d && (setTimeout(function () {
			d.update()
		}), this.Eh.index() === b && d.scrollTop())
	}).e(this.Eh, "select", function (b) {
		this.CD =
			b = b.data.index;
		Nr(this, b);
		Y.Y({type: "ga_click_top_nav_noti_tab", data: {Eh: +b}});
		this.uc || cj.ff("noti7-tab", b)
	});
	this.Eh.o(this.wrap);
	!eh.Sc && navigator.userAgent.match(/iPad/i) == k && (this.Om = z.map(this.contents, function (b) {
		var d = new Er;
		d.o(b);
		return d
	}));
	eh.Sc && (this.Cw = n);
	(new Jr(this.Xv[1], "people", ["zg-follow", "zg-unfollow"])).B();
	this.Am = I("zh-top-nav-pm-count");
	this.Am || (this.Am = K("span"));
	this.sm = I("zh-top-nav-new-pm");
	this.sm || (this.sm = K("span"));
	this.Co = parseInt($(this.sm).attr("data-count") ||
		$(this.Am).attr("data-count"), 10) || 0;
	this.mG = I("zh-top-nav-count-wrap");
	this.mG.innerHTML && (this.count = +this.mG.innerHTML);
	this.h().e(Y, "inbox", this.IO)
};
t.fs = function (b) {
	!uc(this.wrap, b.target) && !uc(this.sr, b.target) && Or(this, n)
};
a.Nr = function (b, c) {
	b.Om && z.forEach(b.Om, function (b, e) {
		c === e ? b.Iw || (b.h().e(b.fQ, "scroll", function () {
			this.oB.fire()
		}), A || (b.h().e(b.Yq, "click", b.IR), b.h().e(document, "mousedown", b.qS), b.h().e(document, "mouseup", b.sS), b.h().e(document, "mousemove", b.rS)), b.options.KL ? (b.Fc = new Kd(200), b.h().e(b.Fc, Ld, function () {
			2 === this.kz || 1 === this.kz ? (Gr(this), this.Vp && this.Yk.css({opacity: this.options.kD})) : !this.Lr && !this.An && (Hr(this, 1E3), this.Yk.css({opacity: 0}))
		})) : (b.ve.css({opacity: b.options.xv}), b.Yk.css({opacity: b.options.kD})),
			b.Fc && b.Fc.start(), Hr(b), b.Iw = j) : b.Iw && (b.h().Uc(), b.Fc && b.Fc.stop(), b.Iw = n)
	})
};
t.ka = function (b) {
	var c = b.target;
	c && c.name && "set" === c.name && this.B_(b)
};
t.XO = function (b) {
	this.WG = this.eg;
	this.eg = b.pb;
	this.uc = this.eg[0] + this.eg[1] + this.eg[2];
	R(this.Qn, !!this.uc);
	this.Qn.innerHTML = 99 < this.uc ? "99+" : this.uc;
	z.forEach(this.eg, function (b, d) {
		R(this.PG[d], b);
		b && (this.mf[d] = n);
		this.Cw && 0 < b - this.WG[d] && this.Tl(d)
	}, this);
	Pr(this)
};
a.Pr = function (b) {
	var c = 99 < b.uc ? "99+" : b.uc, d = 99 < b.Co ? "99+" : b.Co;
	window.document.title = (c || d ? "(" + (b.Co ? d + " 封私信" : "") + (b.uc && b.Co ? " / " : "") + (b.uc ? c + " 条消息" : "") + ") " : "") + window.document.title.replace(/^(\(|\uff08)(\d)*(\+)?( )?(\u5c01\u79c1\u4fe1)?( \/ )?(\d)*(\+)?( )?(\u6761\u6d88\u606f)?(\)|\uff09)( )?/g, "")
};
t.GV = function () {
	if (eh.Sc && this.visible)Or(this, n); else if (this.visible && !this.uc)Or(this, n); else {
		Or(this, j);
		var b;
		!this.aw && !this.uc ? (b = (b = cj.get("noti7-tab")) ? Number(b) : 0, this.Eh.select(b), this.Zm[b] = j) : this.uc && (b = z.Sw(this.eg, pf), b = -1 === b ? 0 : b, this.Eh.select(b), this.Zm[b] = j);
		Y.Y({type: "ga_click_top_nav_noti", data: {Eh: this.CD, pJ: +(this.uc || 0)}})
	}
	Pr(this)
};
a.Qr = function (b, c) {
	b.uc -= b.eg[c];
	R(b.PG[c], n);
	0 > b.uc && (b.uc = 0);
	R(b.Qn, !!b.uc);
	b.Qn.innerHTML = b.uc
}, a.Mr = function (b, c) {
	var d;
	b.Cw ? b.visible && (b.mf[c] ? ("$$used$$" !== b.mf[c] && (b.Xv[c].innerHTML = b.mf[c], b.mf[c] = "$$used$$"), b.eg[c] && (d = new V(n), d.ajax("/noti7/readall", "tab=" + b.types[c], "POST")), Qr(b, c), b.Om && b.Om[c].update().scrollTop(), b.uc || cj.ff("noti7-tab", c)) : (b.Zm[c] = j, b.Tl(c))) : b.mf[c] ? ("$$used$$" !== b.mf[c] && (b.Xv[c].innerHTML = b.mf[c], b.mf[c] = "$$used$$"), b.eg[c] && (d = new V(n), d.ajax("/noti7/readall",
		"tab=" + b.types[c], "POST")), Qr(b, c)) : (b.Zm[c] = j, b.Tl(c), d = new V(n), d.ajax("/noti7/readall", "tab=" + b.types[c], "POST"))
}, a.Or = function (b, c) {
	c ? b.XB.fadeIn(50) : b.XB.fadeOut(50);
	b.visible = c;
	E.enable(b.sr, "open", b.visible);
	c ? (z.forEach(b.mf, function (b, c) {
		b || this.Tl(c)
	}, b), b.h().e(document, "click", b.fs)) : b.h().ya(document, "click", b.fs);
	Nr(b, -1)
};
t.Tl = function (b) {
	if (!this.Ul[b] || !this.Ul[b].Lb())this.Ul[b] = new V(n), this.h().e(this.Ul[b], "success", function (c) {
		this.vz(c, b)
	}), this.Ul[b].ajax("/noti7/stack/" + this.types[b] + "?r=" + za(), "", "GET")
};
t.vz = function (b, c) {
	$(this.XQ[c]).hide();
	var d = Je(this.Ul[c]);
	if (d)if (d.r)U(d.msg); else {
		this.aw = j;
		if (d = d.msg)1 === c && (d = '<div class="zm-noti7-content-head-item"><span class="zg-gray-normal">这些人最近关注了你</span></div>' + d); else switch (c) {
			case 0:
				d = "<div class='zm-noti7-popup-empty'>暂无新消息</div>";
				break;
			case 1:
				d = "<div class='zm-noti7-popup-empty'>有人关注你时会显示在这里</div>";
				break;
			case 2:
				d = "<div class='zm-noti7-popup-empty'>你的答案收到赞同、感谢时会显示在这里</div>"
		}
		this.mf[c] = d;
		this.Zm[c] && (Mr(this, c), this.Zm[c] = n)
	}
};
t.IO = function (b) {
	this.Co = b = $.isNumeric(b) ? b : b.pb;
	0 !== b ? (this.sm.innerHTML = this.Am.innerHTML = b, this.sm.style.visibility = this.Am.style.visibility = "visible") : this.sm.style.visibility = this.Am.style.visibility = "hidden";
	Pr(this)
};
a.Rr = function (b) {
	T.call(this);
	$.extend(this.G = {}, this.U, b || {})
};
y(Rr, T);
t = Rr.prototype;
t.U = {trigger: "hover", sH: "open", hideFocus: n};
t.Lc = function () {
	return this.Og.length && this.Ic.length
};
t.o = function (b) {
	if (b) {
		var c = $(b), d = c.prev();
		this.Og = c;
		this.Ic = d;
		this.Ou = c.parent();
		Rr.n.o.call(this, b);
		return this
	}
};
t.toggle = function () {
	this.vb() ? this.close() : this.open()
};
t.vb = function () {
	return this.Og.is(":visible")
};
t.open = function () {
	this.Og.attr("aria-hidden", "false").parent().addClass(this.G.sH);
	this.Ic.attr("aria-expanded", "true")
};
t.close = function () {
	this.Og.attr("aria-hidden", "true").parent().removeClass(this.G.sH);
	this.Ic.attr("aria-expanded", "false")
};
a.Sr = function (b, c) {
	var d = b.Og.children().find("a"), e = d.size();
	c >= e ? c = 0 : -1 >= c && (c = e - 1);
	d = d.eq(c);
	b.Ic.attr("aria-activedescendant", d.attr("id"));
	d.focus();
	b.index = c
};
