/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Convolution shader
 * ported from o3d sample to WebGL / GLSL
 * http://o3d.googlecode.com/svn/trunk/samples/convolution.html
 */
THREE.ConvolutionShader = {
	defines: {
		KERNEL_SIZE_FLOAT: "25.0",
		KERNEL_SIZE_INT: "25"
	},
	uniforms: {
		tDiffuse: {
			value: null
		},
		uImageIncrement: {
			value: new THREE.Vector2(.001953125, 0)
		},
		cKernel: {
			value: []
		}
	},
	vertexShader: ["uniform vec2 uImageIncrement;", "varying vec2 vUv;", "void main() {", "vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
	fragmentShader: ["uniform float cKernel[ KERNEL_SIZE_INT ];", "uniform sampler2D tDiffuse;", "uniform vec2 uImageIncrement;", "varying vec2 vUv;", "void main() {", "vec2 imageCoord = vUv;", "vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );", "for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {", "sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];", "imageCoord += uImageIncrement;", "}", "gl_FragColor = sum;", "}"].join("\n"),
	buildKernel: function(e) {
		function t(e, t) {
			return Math.exp(-(e * e) / (2 * t * t))
		}
		var i, n, r, o, a = 25,
			s = 2 * Math.ceil(3 * e) + 1;
		for(s > a && (s = a), o = .5 * (s - 1), n = new Array(s), r = 0, i = 0; s > i; ++i) n[i] = t(i - o, e), r += n[i];
		for(i = 0; s > i; ++i) n[i] /= r;
		return n
	}
},
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */
THREE.CopyShader = {
	uniforms: {
		tDiffuse: {
			value: null
		},
		opacity: {
			value: 1
		}
	},
	vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
	fragmentShader: ["uniform float opacity;", "uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {", "vec4 texel = texture2D( tDiffuse, vUv );", "gl_FragColor = opacity * texel;", "}"].join("\n")
},
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Film grain & scanlines shader
 *
 * - ported from HLSL to WebGL / GLSL
 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
 *
 * Screen Space Static Postprocessor
 *
 * Produces an analogue noise overlay similar to a film grain / TV static
 *
 * Original implementation and noise algorithm
 * Pat 'Hawthorne' Shearon
 *
 * Optimized scanlines + noise version with intensity scaling
 * Georg 'Leviathan' Steinrohder
 *
 * This version is provided under a Creative Commons Attribution 3.0 License
 * http://creativecommons.org/licenses/by/3.0/
 */
THREE.FilmShader = {
	uniforms: {
		tDiffuse: {
			value: null
		},
		time: {
			value: 0
		},
		nIntensity: {
			value: .5
		},
		sIntensity: {
			value: .05
		},
		sCount: {
			value: 4096
		},
		grayscale: {
			value: 1
		}
	},
	vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
	fragmentShader: ["#include <common>", "uniform float time;", "uniform bool grayscale;", "uniform float nIntensity;", "uniform float sIntensity;", "uniform float sCount;", "uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {", "vec4 cTextureScreen = texture2D( tDiffuse, vUv );", "float dx = rand( vUv + time );", "vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx, 0.0, 1.0 );", "vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );", "cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;", "cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );", "if( grayscale ) {", "cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );", "}", "gl_FragColor =  vec4( cResult, cTextureScreen.a );", "}"].join("\n")
},
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Focus shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */
THREE.FocusShader = {
	uniforms: {
		tDiffuse: {
			value: null
		},
		screenWidth: {
			value: 1024
		},
		screenHeight: {
			value: 1024
		},
		sampleDistance: {
			value: .794
		},
		waveFactor: {
			value: .00125
		}
	},
	vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
	fragmentShader: ["uniform float screenWidth;", "uniform float screenHeight;", "uniform float sampleDistance;", "uniform float waveFactor;", "uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {", "vec4 color, org, tmp, add;", "float sample_dist, f;", "vec2 vin;", "vec2 uv = vUv;", "add = color = org = texture2D( tDiffuse, uv );", "vin = ( uv - vec2( 0.5 ) ) * vec2( 1.4 );", "sample_dist = dot( vin, vin ) * 2.0;", "f = ( waveFactor * 100.0 + sample_dist ) * sampleDistance * 4.0;", "vec2 sampleSize = vec2(  1.0 / screenWidth, 1.0 / screenHeight ) * vec2( f );", "add += tmp = texture2D( tDiffuse, uv + vec2( 0.111964, 0.993712 ) * sampleSize );", "if( tmp.b < color.b ) color = tmp;", "add += tmp = texture2D( tDiffuse, uv + vec2( 0.846724, 0.532032 ) * sampleSize );", "if( tmp.b < color.b ) color = tmp;", "add += tmp = texture2D( tDiffuse, uv + vec2( 0.943883, -0.330279 ) * sampleSize );", "if( tmp.b < color.b ) color = tmp;", "add += tmp = texture2D( tDiffuse, uv + vec2( 0.330279, -0.943883 ) * sampleSize );", "if( tmp.b < color.b ) color = tmp;", "add += tmp = texture2D( tDiffuse, uv + vec2( -0.532032, -0.846724 ) * sampleSize );", "if( tmp.b < color.b ) color = tmp;", "add += tmp = texture2D( tDiffuse, uv + vec2( -0.993712, -0.111964 ) * sampleSize );", "if( tmp.b < color.b ) color = tmp;", "add += tmp = texture2D( tDiffuse, uv + vec2( -0.707107, 0.707107 ) * sampleSize );", "if( tmp.b < color.b ) color = tmp;", "color = color * vec4( 2.0 ) - ( add / vec4( 8.0 ) );", "color = color + ( add / vec4( 8.0 ) - color ) * ( vec4( 1.0 ) - vec4( sample_dist * 0.5 ) );", "gl_FragColor = vec4( color.rgb * color.rgb * vec3( 0.95 ) + color.rgb, 1.0 );", "}"].join("\n")
},
/**
 * @author alteredq / http://alteredqualia.com/
 */
THREE.EffectComposer = function(e, t) {
	if(this.renderer = e, void 0 === t) {
		var i = {
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
				format: THREE.RGBAFormat,
				stencilBuffer: !1
			},
			n = e.getSize();
		t = new THREE.WebGLRenderTarget(n.width, n.height, i)
	}
	this.renderTarget1 = t, this.renderTarget2 = t.clone(), this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2, this.passes = [], void 0 === THREE.CopyShader && console.error("THREE.EffectComposer relies on THREE.CopyShader"), this.copyPass = new THREE.ShaderPass(THREE.CopyShader)
}, Object.assign(THREE.EffectComposer.prototype, {
	swapBuffers: function() {
		var e = this.readBuffer;
		this.readBuffer = this.writeBuffer, this.writeBuffer = e
	},
	addPass: function(e) {
		this.passes.push(e);
		var t = this.renderer.getSize();
		e.setSize(t.width, t.height)
	},
	insertPass: function(e, t) {
		this.passes.splice(t, 0, e)
	},
	render: function(e) {
		var t, i, n = !1,
			r = this.passes.length;
		for(i = 0; r > i; i++)
			if(t = this.passes[i], t.enabled !== !1) {
				if(t.render(this.renderer, this.writeBuffer, this.readBuffer, e, n), t.needsSwap) {
					if(n) {
						var o = this.renderer.context;
						o.stencilFunc(o.NOTEQUAL, 1, 4294967295), this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, e), o.stencilFunc(o.EQUAL, 1, 4294967295)
					}
					this.swapBuffers()
				}
				void 0 !== THREE.MaskPass && (t instanceof THREE.MaskPass ? n = !0 : t instanceof THREE.ClearMaskPass && (n = !1))
			}
	},
	reset: function(e) {
		if(void 0 === e) {
			var t = this.renderer.getSize();
			e = this.renderTarget1.clone(), e.setSize(t.width, t.height)
		}
		this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.renderTarget1 = e, this.renderTarget2 = e.clone(), this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2
	},
	setSize: function(e, t) {
		this.renderTarget1.setSize(e, t), this.renderTarget2.setSize(e, t);
		for(var i = 0; i < this.passes.length; i++) this.passes[i].setSize(e, t)
	}
}), THREE.Pass = function() {
	this.enabled = !0, this.needsSwap = !0, this.clear = !1, this.renderToScreen = !1
}, Object.assign(THREE.Pass.prototype, {
	setSize: function() {},
	render: function() {
		console.error("THREE.Pass: .render() must be implemented in derived pass.")
	}
}),
/**
 * @author alteredq / http://alteredqualia.com/
 */
THREE.MaskPass = function(e, t) {
	THREE.Pass.call(this), this.scene = e, this.camera = t, this.clear = !0, this.needsSwap = !1, this.inverse = !1
}, THREE.MaskPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
	constructor: THREE.MaskPass,
	render: function(e, t, i) {
		var n = e.context,
			r = e.state;
		r.buffers.color.setMask(!1), r.buffers.depth.setMask(!1), r.buffers.color.setLocked(!0), r.buffers.depth.setLocked(!0);
		var o, a;
		this.inverse ? (o = 0, a = 1) : (o = 1, a = 0), r.buffers.stencil.setTest(!0), r.buffers.stencil.setOp(n.REPLACE, n.REPLACE, n.REPLACE), r.buffers.stencil.setFunc(n.ALWAYS, o, 4294967295), r.buffers.stencil.setClear(a), e.render(this.scene, this.camera, i, this.clear), e.render(this.scene, this.camera, t, this.clear), r.buffers.color.setLocked(!1), r.buffers.depth.setLocked(!1), r.buffers.stencil.setFunc(n.EQUAL, 1, 4294967295), r.buffers.stencil.setOp(n.KEEP, n.KEEP, n.KEEP)
	}
}), THREE.ClearMaskPass = function() {
	THREE.Pass.call(this), this.needsSwap = !1
}, THREE.ClearMaskPass.prototype = Object.create(THREE.Pass.prototype), Object.assign(THREE.ClearMaskPass.prototype, {
	render: function(e) {
		e.state.buffers.stencil.setTest(!1)
	}
}),
/**
 * @author alteredq / http://alteredqualia.com/
 */
THREE.RenderPass = function(e, t, i, n, r) {
	THREE.Pass.call(this), this.scene = e, this.camera = t, this.overrideMaterial = i, this.clearColor = n, this.clearAlpha = void 0 !== r ? r : 0, this.clear = !0, this.clearDepth = !1, this.needsSwap = !1
}, THREE.RenderPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
	constructor: THREE.RenderPass,
	render: function(e, t, i) {
		var n = e.autoClear;
		e.autoClear = !1, this.scene.overrideMaterial = this.overrideMaterial;
		var r, o;
		this.clearColor && (r = e.getClearColor().getHex(), o = e.getClearAlpha(), e.setClearColor(this.clearColor, this.clearAlpha)), this.clearDepth && e.clearDepth(), e.render(this.scene, this.camera, this.renderToScreen ? null : i, this.clear), this.clearColor && e.setClearColor(r, o), this.scene.overrideMaterial = null, e.autoClear = n
	}
}),
/**
 * @author alteredq / http://alteredqualia.com/
 */
THREE.BloomPass = function(e, t, i, n) {
	THREE.Pass.call(this), e = void 0 !== e ? e : 1, t = void 0 !== t ? t : 25, i = void 0 !== i ? i : 4, n = void 0 !== n ? n : 256;
	var r = {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBAFormat
	};
	this.renderTargetX = new THREE.WebGLRenderTarget(n, n, r), this.renderTargetY = new THREE.WebGLRenderTarget(n, n, r), void 0 === THREE.CopyShader && console.error("THREE.BloomPass relies on THREE.CopyShader");
	var o = THREE.CopyShader;
	this.copyUniforms = THREE.UniformsUtils.clone(o.uniforms), this.copyUniforms.opacity.value = e, this.materialCopy = new THREE.ShaderMaterial({
		uniforms: this.copyUniforms,
		vertexShader: o.vertexShader,
		fragmentShader: o.fragmentShader,
		blending: THREE.AdditiveBlending,
		transparent: !0
	}), void 0 === THREE.ConvolutionShader && console.error("THREE.BloomPass relies on THREE.ConvolutionShader");
	var a = THREE.ConvolutionShader;
	this.convolutionUniforms = THREE.UniformsUtils.clone(a.uniforms), this.convolutionUniforms.uImageIncrement.value = THREE.BloomPass.blurX, this.convolutionUniforms.cKernel.value = THREE.ConvolutionShader.buildKernel(i), this.materialConvolution = new THREE.ShaderMaterial({
		uniforms: this.convolutionUniforms,
		vertexShader: a.vertexShader,
		fragmentShader: a.fragmentShader,
		defines: {
			KERNEL_SIZE_FLOAT: t.toFixed(1),
			KERNEL_SIZE_INT: t.toFixed(0)
		}
	}), this.needsSwap = !1, this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), this.scene = new THREE.Scene, this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null), this.quad.frustumCulled = !1, this.scene.add(this.quad)
}, THREE.BloomPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
	constructor: THREE.BloomPass,
	render: function(e, t, i, n, r) {
		r && e.context.disable(e.context.STENCIL_TEST), this.quad.material = this.materialConvolution, this.convolutionUniforms.tDiffuse.value = i.texture, this.convolutionUniforms.uImageIncrement.value = THREE.BloomPass.blurX, e.render(this.scene, this.camera, this.renderTargetX, !0), this.convolutionUniforms.tDiffuse.value = this.renderTargetX.texture, this.convolutionUniforms.uImageIncrement.value = THREE.BloomPass.blurY, e.render(this.scene, this.camera, this.renderTargetY, !0), this.quad.material = this.materialCopy, this.copyUniforms.tDiffuse.value = this.renderTargetY.texture, r && e.context.enable(e.context.STENCIL_TEST), e.render(this.scene, this.camera, i, this.clear)
	}
}), THREE.BloomPass.blurX = new THREE.Vector2(.001953125, 0), THREE.BloomPass.blurY = new THREE.Vector2(0, .001953125),
/**
 * @author alteredq / http://alteredqualia.com/
 */
THREE.ShaderPass = function(e, t) {
	THREE.Pass.call(this), this.textureID = void 0 !== t ? t : "tDiffuse", e instanceof THREE.ShaderMaterial ? (this.uniforms = e.uniforms, this.material = e) : e && (this.uniforms = THREE.UniformsUtils.clone(e.uniforms), this.material = new THREE.ShaderMaterial({
		defines: e.defines || {},
		uniforms: this.uniforms,
		vertexShader: e.vertexShader,
		fragmentShader: e.fragmentShader
	})), this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), this.scene = new THREE.Scene, this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null), this.quad.frustumCulled = !1, this.scene.add(this.quad)
}, THREE.ShaderPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
	constructor: THREE.ShaderPass,
	render: function(e, t, i) {
		this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = i.texture), this.quad.material = this.material, this.renderToScreen ? e.render(this.scene, this.camera) : e.render(this.scene, this.camera, t, this.clear)
	}
}),
/**
 * @author alteredq / http://alteredqualia.com/
 */
THREE.FilmPass = function(e, t, i, n) {
	THREE.Pass.call(this), void 0 === THREE.FilmShader && console.error("THREE.FilmPass relies on THREE.FilmShader");
	var r = THREE.FilmShader;
	this.uniforms = THREE.UniformsUtils.clone(r.uniforms), this.material = new THREE.ShaderMaterial({
		uniforms: this.uniforms,
		vertexShader: r.vertexShader,
		fragmentShader: r.fragmentShader
	}), void 0 !== n && (this.uniforms.grayscale.value = n), void 0 !== e && (this.uniforms.nIntensity.value = e), void 0 !== t && (this.uniforms.sIntensity.value = t), void 0 !== i && (this.uniforms.sCount.value = i), this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), this.scene = new THREE.Scene, this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null), this.quad.frustumCulled = !1, this.scene.add(this.quad)
}, THREE.FilmPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
	constructor: THREE.FilmPass,
	render: function(e, t, i, n) {
		this.uniforms.tDiffuse.value = i.texture, this.uniforms.time.value += n, this.quad.material = this.material, this.renderToScreen ? e.render(this.scene, this.camera) : e.render(this.scene, this.camera, t, this.clear)
	}
}),
/**
 * Break faces with edges longer than maxEdgeLength
 * - not recursive
 *
 * @author alteredq / http://alteredqualia.com/
 */
THREE.TessellateModifier = function(e) {
	this.maxEdgeLength = e
}, THREE.TessellateModifier.prototype.modify = function(e) {
	for(var t, i = [], n = [], r = this.maxEdgeLength * this.maxEdgeLength, o = 0, a = e.faceVertexUvs.length; a > o; o++) n[o] = [];
	for(var o = 0, a = e.faces.length; a > o; o++) {
		var s = e.faces[o];
		if(s instanceof THREE.Face3) {
			var c = s.a,
				h = s.b,
				l = s.c,
				u = e.vertices[c],
				p = e.vertices[h],
				d = e.vertices[l],
				f = u.distanceToSquared(p),
				m = p.distanceToSquared(d),
				g = u.distanceToSquared(d);
			if(f > r || m > r || g > r) {
				var v = e.vertices.length,
					y = s.clone(),
					x = s.clone();
				if(f >= m && f >= g) {
					var b = u.clone();
					if(b.lerp(p, .5), y.a = c, y.b = v, y.c = l, x.a = v, x.b = h, x.c = l, 3 === s.vertexNormals.length) {
						var _ = s.vertexNormals[0].clone();
						_.lerp(s.vertexNormals[1], .5), y.vertexNormals[1].copy(_), x.vertexNormals[0].copy(_)
					}
					if(3 === s.vertexColors.length) {
						var w = s.vertexColors[0].clone();
						w.lerp(s.vertexColors[1], .5), y.vertexColors[1].copy(w), x.vertexColors[0].copy(w)
					}
					t = 0
				} else if(m >= f && m >= g) {
					var b = p.clone();
					if(b.lerp(d, .5), y.a = c, y.b = h, y.c = v, x.a = v, x.b = l, x.c = c, 3 === s.vertexNormals.length) {
						var _ = s.vertexNormals[1].clone();
						_.lerp(s.vertexNormals[2], .5), y.vertexNormals[2].copy(_), x.vertexNormals[0].copy(_), x.vertexNormals[1].copy(s.vertexNormals[2]), x.vertexNormals[2].copy(s.vertexNormals[0])
					}
					if(3 === s.vertexColors.length) {
						var w = s.vertexColors[1].clone();
						w.lerp(s.vertexColors[2], .5), y.vertexColors[2].copy(w), x.vertexColors[0].copy(w), x.vertexColors[1].copy(s.vertexColors[2]), x.vertexColors[2].copy(s.vertexColors[0])
					}
					t = 1
				} else {
					var b = u.clone();
					if(b.lerp(d, .5), y.a = c, y.b = h, y.c = v, x.a = v, x.b = h, x.c = l, 3 === s.vertexNormals.length) {
						var _ = s.vertexNormals[0].clone();
						_.lerp(s.vertexNormals[2], .5), y.vertexNormals[2].copy(_), x.vertexNormals[0].copy(_)
					}
					if(3 === s.vertexColors.length) {
						var w = s.vertexColors[0].clone();
						w.lerp(s.vertexColors[2], .5), y.vertexColors[2].copy(w), x.vertexColors[0].copy(w)
					}
					t = 2
				}
				i.push(y, x), e.vertices.push(b);
				for(var E = 0, M = e.faceVertexUvs.length; M > E; E++)
					if(e.faceVertexUvs[E].length) {
						var T = e.faceVertexUvs[E][o],
							S = T[0],
							A = T[1],
							R = T[2];
						if(0 === t) {
							var L = S.clone();
							L.lerp(A, .5);
							var P = [S.clone(), L.clone(), R.clone()],
								C = [L.clone(), A.clone(), R.clone()]
						} else if(1 === t) {
							var L = A.clone();
							L.lerp(R, .5);
							var P = [S.clone(), A.clone(), L.clone()],
								C = [L.clone(), R.clone(), S.clone()]
						} else {
							var L = S.clone();
							L.lerp(R, .5);
							var P = [S.clone(), A.clone(), L.clone()],
								C = [L.clone(), A.clone(), R.clone()]
						}
						n[E].push(P, C)
					}
			} else {
				i.push(s);
				for(var E = 0, M = e.faceVertexUvs.length; M > E; E++) n[E].push(e.faceVertexUvs[E][o])
			}
		}
	}
	e.faces = i, e.faceVertexUvs = n
};
var TWEEN = TWEEN || function() {
	var e = [];
	return {
		REVISION: "7",
		getAll: function() {
			return e
		},
		removeAll: function() {
			e = []
		},
		add: function(t) {
			e.push(t)
		},
		remove: function(t) {
			t = e.indexOf(t), -1 !== t && e.splice(t, 1)
		},
		update: function(t) {
			if(0 === e.length) return !1;
			for(var i = 0, n = e.length, t = void 0 !== t ? t : Date.now(); n > i;) e[i].update(t) ? i++ : (e.splice(i, 1), n--);
			return !0
		}
	}
}();
TWEEN.Tween = function(e) {
		var t = {},
			i = {},
			n = 1e3,
			r = 0,
			o = null,
			a = TWEEN.Easing.Linear.None,
			s = TWEEN.Interpolation.Linear,
			c = [],
			h = null,
			l = !1,
			u = null,
			p = null;
		this.to = function(e, t) {
			return null !== t && (n = t), i = e, this
		}, this.start = function(n) {
			TWEEN.add(this), l = !1, o = void 0 !== n ? n : Date.now(), o += r;
			for(var a in i)
				if(null !== e[a]) {
					if(i[a] instanceof Array) {
						if(0 === i[a].length) continue;
						i[a] = [e[a]].concat(i[a])
					}
					t[a] = e[a]
				}
			return this
		}, this.stop = function() {
			return TWEEN.remove(this), this
		}, this.delay = function(e) {
			return r = e, this
		}, this.easing = function(e) {
			return a = e, this
		}, this.interpolation = function(e) {
			return s = e, this
		}, this.chain = function() {
			return c = arguments, this
		}, this.onStart = function(e) {
			return h = e, this
		}, this.onUpdate = function(e) {
			return u = e, this
		}, this.onComplete = function(e) {
			return p = e, this
		}, this.update = function(r) {
			if(o > r) return !0;
			!1 === l && (null !== h && h.call(e), l = !0);
			var d, f = (r - o) / n,
				f = f > 1 ? 1 : f,
				m = a(f);
			for(d in t) {
				var g = t[d],
					v = i[d];
				e[d] = v instanceof Array ? s(v, m) : g + (v - g) * m
			}
			if(null !== u && u.call(e, m), 1 == f) {
				for(null !== p && p.call(e), f = 0, m = c.length; m > f; f++) c[f].start(r);
				return !1
			}
			return !0
		}
	}, 
TWEEN.Easing = {
	Linear: {
		None: function(e) {
			return e
		}
	},
	Quadratic: {
		In: function(e) {
			return e * e
		},
		Out: function(e) {
			return e * (2 - e)
		},
		InOut: function(e) {
			return 1 > (e *= 2) ? .5 * e * e : -.5 * (--e * (e - 2) - 1)
		}
	},
	Cubic: {
		In: function(e) {
			return e * e * e
		},
		Out: function(e) {
			return --e * e * e + 1
		},
		InOut: function(e) {
			return 1 > (e *= 2) ? .5 * e * e * e : .5 * ((e -= 2) * e * e + 2)
		}
	},
	Quartic: {
		In: function(e) {
			return e * e * e * e
		},
		Out: function(e) {
			return 1 - --e * e * e * e
		},
		InOut: function(e) {
			return 1 > (e *= 2) ? .5 * e * e * e * e : -.5 * ((e -= 2) * e * e * e - 2)
		}
	},
	Quintic: {
		In: function(e) {
			return e * e * e * e * e
		},
		Out: function(e) {
			return --e * e * e * e * e + 1
		},
		InOut: function(e) {
			return 1 > (e *= 2) ? .5 * e * e * e * e * e : .5 * ((e -= 2) * e * e * e * e + 2)
		}
	},
	Sinusoidal: {
		In: function(e) {
			return 1 - Math.cos(e * Math.PI / 2)
		},
		Out: function(e) {
			return Math.sin(e * Math.PI / 2)
		},
		InOut: function(e) {
			return .5 * (1 - Math.cos(Math.PI * e))
		}
	},
	Exponential: {
		In: function(e) {
			return 0 === e ? 0 : Math.pow(1024, e - 1)
		},
		Out: function(e) {
			return 1 === e ? 1 : 1 - Math.pow(2, -10 * e)
		},
		InOut: function(e) {
			return 0 === e ? 0 : 1 === e ? 1 : 1 > (e *= 2) ? .5 * Math.pow(1024, e - 1) : .5 * (-Math.pow(2, -10 * (e - 1)) + 2)
		}
	},
	Circular: {
		In: function(e) {
			return 1 - Math.sqrt(1 - e * e)
		},
		Out: function(e) {
			return Math.sqrt(1 - --e * e)
		},
		InOut: function(e) {
			return 1 > (e *= 2) ? -.5 * (Math.sqrt(1 - e * e) - 1) : .5 * (Math.sqrt(1 - (e -= 2) * e) + 1)
		}
	},
	Elastic: {
		In: function(e) {
			var t, i = .1;
			return 0 === e ? 0 : 1 === e ? 1 : (!i || 1 > i ? (i = 1, t = .1) : t = .4 * Math.asin(1 / i) / (2 * Math.PI), -(i * Math.pow(2, 10 * (e -= 1)) * Math.sin(2 * (e - t) * Math.PI / .4)))
		},
		Out: function(e) {
			var t, i = .1;
			return 0 === e ? 0 : 1 === e ? 1 : (!i || 1 > i ? (i = 1, t = .1) : t = .4 * Math.asin(1 / i) / (2 * Math.PI), i * Math.pow(2, -10 * e) * Math.sin(2 * (e - t) * Math.PI / .4) + 1)
		},
		InOut: function(e) {
			var t, i = .1;
			return 0 === e ? 0 : 1 === e ? 1 : (!i || 1 > i ? (i = 1, t = .1) : t = .4 * Math.asin(1 / i) / (2 * Math.PI), 1 > (e *= 2) ? -.5 * i * Math.pow(2, 10 * (e -= 1)) * Math.sin(2 * (e - t) * Math.PI / .4) : .5 * i * Math.pow(2, -10 * (e -= 1)) * Math.sin(2 * (e - t) * Math.PI / .4) + 1)
		}
	},
	Back: {
		In: function(e) {
			return e * e * (2.70158 * e - 1.70158)
		},
		Out: function(e) {
			return --e * e * (2.70158 * e + 1.70158) + 1
		},
		InOut: function(e) {
			return 1 > (e *= 2) ? .5 * e * e * (3.5949095 * e - 2.5949095) : .5 * ((e -= 2) * e * (3.5949095 * e + 2.5949095) + 2)
		}
	},
	Bounce: {
		In: function(e) {
			return 1 - TWEEN.Easing.Bounce.Out(1 - e)
		},
		Out: function(e) {
			return 1 / 2.75 > e ? 7.5625 * e * e : 2 / 2.75 > e ? 7.5625 * (e -= 1.5 / 2.75) * e + .75 : 2.5 / 2.75 > e ? 7.5625 * (e -= 2.25 / 2.75) * e + .9375 : 7.5625 * (e -= 2.625 / 2.75) * e + .984375
		},
		InOut: function(e) {
			return .5 > e ? .5 * TWEEN.Easing.Bounce.In(2 * e) : .5 * TWEEN.Easing.Bounce.Out(2 * e - 1) + .5
		}
	}
}, 
TWEEN.Interpolation = {
	Linear: function(e, t) {
		var i = e.length - 1,
			n = i * t,
			r = Math.floor(n),
			o = TWEEN.Interpolation.Utils.Linear;
		return 0 > t ? o(e[0], e[1], n) : t > 1 ? o(e[i], e[i - 1], i - n) : o(e[r], e[r + 1 > i ? i : r + 1], n - r)
	},
	Bezier: function(e, t) {
		var i, n = 0,
			r = e.length - 1,
			o = Math.pow,
			a = TWEEN.Interpolation.Utils.Bernstein;
		for(i = 0; r >= i; i++) n += o(1 - t, r - i) * o(t, i) * e[i] * a(r, i);
		return n
	},
	CatmullRom: function(e, t) {
		var i = e.length - 1,
			n = i * t,
			r = Math.floor(n),
			o = TWEEN.Interpolation.Utils.CatmullRom;
		return e[0] === e[i] ? (0 > t && (r = Math.floor(n = i * (1 + t))), o(e[(r - 1 + i) % i], e[r], e[(r + 1) % i], e[(r + 2) % i], n - r)) : 0 > t ? e[0] - (o(e[0], e[0], e[1], e[1], -n) - e[0]) : t > 1 ? e[i] - (o(e[i], e[i], e[i - 1], e[i - 1], n - i) - e[i]) : o(e[r ? r - 1 : 0], e[r], e[r + 1 > i ? i : r + 1], e[r + 2 > i ? i : r + 2], n - r)
	},
	Utils: {
		Linear: function(e, t, i) {
			return(t - e) * i + e
		},
		Bernstein: function(e, t) {
			var i = TWEEN.Interpolation.Utils.Factorial;
			return i(e) / i(t) / i(e - t)
		},
		Factorial: function() {
			var e = [1];
			return function(t) {
				var i, n = 1;
				if(e[t]) return e[t];
				for(i = t; i > 1; i--) n *= i;
				return e[t] = n
			}
		}(),
		CatmullRom: function(e, t, i, n, r) {
			var e = .5 * (i - e),
				n = .5 * (n - t),
				o = r * r;
			return(2 * t - 2 * i + e + n) * r * o + (-3 * t + 3 * i - 2 * e - n) * o + e * r + t
		}
	}
},
	
function() {
	function main() {
		createRenderer(), createScene(), createCamera(), createPass(), initModel()
	}

	function update() {
		requestAnimationFrame(update);
		TWEEN.update();
		Z && (S.geometry.verticesNeedUpdate = !0);
		b();//判断是否进入page5
		
		//以下三个函数是针对鼠标的移动改变参数数值
		m();
		g();
		c();
		I && I.update();
		T.render();
	}

	//初始化渲染
	function createRenderer() {
		M = new THREE.WebGLRenderer({
			antialias: !1,
			alpha: !0
		}), M.setSize(B, F), M.sortObjects = !1, M.autoClear = !1, M.domElement.id = "mainanim", document.body.appendChild(M.domElement), window.addEventListener("resize", d), window.addEventListener("orientationchange", d)
	}

	//初始化场景
	function createScene() {
		scene = new THREE.Scene, debug || (scene.fog = new THREE.FogExp2(328972, 5e-4), M.setClearColor(scene.fog.color))
	}
	
	//初始化摄像头
	function createCamera() {
		E = new THREE.PerspectiveCamera(ismobile ? 100 : 75, B / F, 1, 5e4), E.position.set(0, 0, 1e3), E.lookAt(new THREE.Vector3(0, 0, 0))
	}
	
	
	//着色器和后期渲染
	function createPass() {
		var e = new THREE.RenderPass(scene, E), //Render通道效果
			t = new THREE.BloomPass(.75), //Bloom通道效果
			i = new THREE.FilmPass(.5, .5, 1500, !1);//Film通道效果
		
		//着色器
		P = new THREE.ShaderPass(THREE.FocusShader);
		P.uniforms.screenWidth.value = window.innerWidth;
		P.uniforms.screenHeight.value = window.innerHeight;
		P.renderToScreen = !0;
		T = new THREE.EffectComposer(M);//效果组合器
		T.addPass(e);
		T.addPass(t);
		T.addPass(i);
		T.addPass(P);
	}
	
	function initModel() {
		if(!ismobile) var e = new THREE.TessellateModifier(.01);
		var t = 0,
			i = ["//game.gtimg.cn/images/up/act/a20170301pre/js/obj/cpgame3.json", "//game.gtimg.cn/images/up/act/a20170301pre/js/obj/cpac5.json", "//game.gtimg.cn/images/up/act/a20170301pre/js/obj/cpbook2.json", "//game.gtimg.cn/images/up/act/a20170301pre/js/obj/cpmovie4.json", "//game.gtimg.cn/images/up/act/a20170301pre/js/obj/cpkv3.json", "//game.gtimg.cn/images/up/act/a20170301pre/js/obj/qr.json"],
			n = [700, 700, 1e3, 1200, 1500, 500],
			r = [
				[72, 30, 60],
				[0, -30, 0],
				[0, 0, 0],
				[90, 180, 0],
				[10, 0, 0],
				[0, 0, 0]
			],
			o = [
				[-400, 100, 0],
				[400, 0, 0],
				[-500, 150, 0],
				[0, 0, 0],
				[0, -500, 0],
				[0, 0, 0]
			];
		ismobile && (n = [700, 700, 1e3, 1200, 2e3, 500], r = [
			[72, 30, 60],
			[0, -30, 0],
			[10, 0, 0],
			[90, 180, 0],
			[-10, 0, 0],
			[0, 0, 0]
		], o = [
			[-250, 200, 0],
			[400, 50, 0],
			[-100, 250, 0],
			[0, 200, 0],
			[0, -800, 0],
			[0, 0, 0]
		]), i.forEach(function(s, c) {
			(new THREE.JSONLoader).load(s, function(m_json) {
				
				$("body").trigger("resloading"), resloaded += .1;
				s.match(/.*\/(.*?\.json)$/)[1];
				c !== i.length - 2 || ismobile || e.modify(m_json), ismobile && m_json.vertices.length > 4e3, m_json.center(), m_json.normalize(), m_json.rotateX(3.14 * r[c][0] / 180), m_json.rotateY(3.14 * r[c][1] / 180), m_json.rotateZ(3.14 * r[c][2] / 180), m_json.scale(n[c], n[c], n[c]), m_json.translate(o[c][0], o[c][1], o[c][2]);
				var l = [];
				m_json.vertices.forEach(function() {
					l.push(new THREE.Color("hsl(160, 100%, 100%)"))
				});
				for(var u = 0; u < m_json.faces.length; u++) {
					var p = m_json.faces[u];
					l[p.a] = p.vertexColors[0] || new THREE.Color("hsl(" + (160 + 0 * Math.random()) + ", 100%, 100%)"), l[p.b] = p.vertexColors[1] || new THREE.Color("hsl(" + (160 + 0 * Math.random()) + ", 100%, 100%)"), l[p.c] = p.vertexColors[2] || new THREE.Color("hsl(" + (160 + 0 * Math.random()) + ", 100%, 100%)")
				}
				m_json.colors = l;
				models[c] = m_json;
				t++;
				t === i.length && createParticles();
				
			})
		})
	}
	
	//创建粒子群
	function createParticles() {
		console.log("创建粒子群")
		var e = new THREE.Geometry,
			t = 1e3,
			i = Math.max.apply(null, models.map(function(e) { //获取模型中顶点数最多的数量
				return e.vertices.length
			}));
		e.colors = [];
		for(var n = 0; i > n; n++) 
		{
			//console.log(new THREE.Vector3(_(-1 * t, t), _(-1 * t, t), _(-12 * t, 1 * t)))
			
			e.vertices.push(1e6 > n ? new THREE.Vector3(_(-1 * t, t), _(-1 * t, t), _(-12 * t, 1 * t)) : new THREE.Vector3(0, 0, 0)), e.colors.push(new THREE.Color("hsl(" + (180 + 10 * Math.random()) + ", 100%, 100%)"));
			
		}
		var r = new THREE.TextureLoader;
		r.crossOrigin = "";
		r.load("//game.gtimg.cn/images/up/act/a20170301pre/images/three/gradient.png", function(i) {
			var n = new THREE.PointsMaterial({ //创建点
				size: 5,
				map: i,//设置材质
				blending: THREE.AdditiveBlending,
				depthTest: !0,
				alphaTest: .1,
				opacity: 1,
				transparent: !0,
				vertexColors: THREE.VertexColors
			});
			S = new THREE.Points(e, n);
			S.position.z = -1 * t;
			createPage6()
		})
	}

	function s() {
		var e = new THREE.Geometry,
			t = 1500,
			i = 500;
		e.colors = [];
		for(var n = 0; i > n; n++) e.vertices.push(new THREE.Vector3(_(-1 * t, t), _(-1 * t, t), _(-1 * t, t))), e.colors.push(new THREE.Color("hsl(" + (190 + 30 * Math.random()) + ", 0%, 100%)"));
		var r = new THREE.TextureLoader;
		r.crossOrigin = "";
		r.load("//game.gtimg.cn/images/up/act/a20170301pre/images/three/gradient.png", function(i) {
			var n = new THREE.PointsMaterial({
				size: 7,
				map: i,
				depthTest: !0,
				alphaTest: .1,
				opacity: 1,
				transparent: !0,
				vertexColors: THREE.VertexColors
			});
			A = new THREE.Points(e, n);
			A.position.z = -1 * t;
			A.position.x = -.1 * t;
			R = new THREE.Points(e, n);
			R.position.z = -1.1 * t;
			R.position.y = -.2 * t;
			L = new THREE.Points(e, n);
			L.position.z = -1.2 * t;
			scene.add(A), scene.add(R), scene.add(L)
		})
	}

	
	
	
	//创建page6
	function createPage6() {
		C = new THREE.Object3D;
		C.add(S);
		for(var e = ["//game.gtimg.cn/images/up/act/a20170301pre/images/three/banner1.png", "//game.gtimg.cn/images/up/act/a20170301pre/images/three/banner2.png", "//game.gtimg.cn/images/up/act/a20170301pre/images/three/banner3.png", "//game.gtimg.cn/images/up/act/a20170301pre/images/three/banner4.png"], t = 3e3, i = -1e3, n = new THREE.PlaneBufferGeometry(1024, 512), r = 0, o = 0; o < e.length; o++) ! function(o) {
			var a = new THREE.TextureLoader;
			a.crossOrigin = "", a.load(e[o], function(a) {
				$("body").trigger("resloading"), resloaded += .1;
				var s = new THREE.MeshLambertMaterial({
					side: THREE.DoubleSide,
					color: 16777215,
					map: a,
					transparent: !0
				});
				s.map = a;
				var c = new THREE.Mesh(n, s);
				c.position.z = i - t * o, C.add(c), r++, r === e.length && (C.position.z = -2e3, scene.add(C), $("body").trigger("resloaded"))
			})
		}(o)
		
	}

	function introBox() {
		
		for(var e, i = debug ? 2e3 : 25e3, n = 5, r = 1e3, o = 3e3, a = new TWEEN.Tween(S.position).to({
				z: .1
			}, i).easing(TWEEN.Easing.Linear.None).delay(1e3).onUpdate(function() {}).onStart(function() {}).onComplete(function() {}), s = [], c = 0; n > c; c++)e = new TWEEN.Tween(C.position).to({
			z: r + o * c
		}, i / n).easing(TWEEN.Easing.Quintic.InOut).onUpdate(function() {}).onStart(function() {}).onComplete(function() {}), s.push(e);
		for(var c = 0; c < s.length - 1; c++) s[c].chain(s[c + 1]);
		
		s[0].start();
		a.start();
		
		setTimeout(function() {
			introed || (v(), $("body").trigger("introed"))
		}, i - 1e3);
		
		update()
	}

	 

	function p(e) {
		
		isnowpop || X || (V = 3e-4 * (e.clientX - z), k = 1e-4 * (e.clientY - H))
	}

	function d() {
		E.aspect = window.innerWidth / window.innerHeight, E.updateProjectionMatrix(), M.setSize(window.innerWidth, window.innerHeight), T.reset(), P.uniforms.screenWidth.value = window.innerWidth, P.uniforms.screenHeight.value = window.innerHeight
	}

	function skipIntrobox() {
		TWEEN.removeAll(), S.position.z = .1, v(), $("body").trigger("introed")
	}

	function m() {
		
		S && introed && stormed && !X && (G += W.qrcode, S.rotation.y = .2 * Math.sin(G))
	}

	function g() {
		X && (V = 0, k = 0), scene.rotation.y += (V - scene.rotation.y) / 50, scene.rotation.x += (k - scene.rotation.x) / 50
	}
	
	
	function c() {
		A && introed && (A.rotation.x -= W.firefly / 1.5, R.rotation.y += W.firefly, L.rotation.z += W.firefly / 2)
	}
	
	function v() {
		var e = 1e3;
		scene.remove(C);
		S.geometry.vertices.forEach(function(t) {
			t.x = _(-1 * e, 1 * e), t.y = _(-1 * e, 1 * e), t.z = _(-1 * e, 1 * e);
		});
		S.geometry.verticesNeedUpdate = !0;
		scene.add(S);
		document.body.addEventListener("mousemove", p);
		s()
	}
	
	//初始化的旋转
	function y() {
		//console.log("befort:"+S.rotation.x+","+S.rotation.y+","+S.rotation.z)
		S.rotation.y = 3.14 * -.4;
		
		//让S绕着Y轴旋转
		new TWEEN.Tween(S.rotation).easing(TWEEN.Easing.Quintic.Out).to({
			y: 0
		}, 1e4).onUpdate(function() {}).onComplete(function() {
			stormed = !0
		}).start()
		
		console.log("初始形状完成")
	}
	
	//变换形状
	function changeShape(e) {
		q = "undefined" == typeof e ? ++q % models.length : e % models.length, X = e === models.length - 2 ? !0 : !1, Z = !0, clearTimeout(U), U = setTimeout(function() {
			Z = !1
		}, Y * (J + 2));
		var t = models[q];
		
		S.material.tween || (S.material.tween = new TWEEN.Tween(S.material).easing(TWEEN.Easing.Exponential.In));
		S.material.tween.stop();
		ismobile || (q === models.length - 1 ? (W.qrcode = W.qrcodeFAST, clearTimeout(N), S.material.map = null, S.material.needsUpdate = !0, 20 !== S.material.size && S.material.tween.to({
			size: 20
		}, Y * (J + 1)).start()) : (W.qrcode = W.qrcodeSLOW, N = setTimeout(function() {
			var e = new THREE.TextureLoader;

			e.crossOrigin = "", e.load("images/three/gradient.png", function(e) {
				S.material.map = e, S.material.needsUpdate = !0
			})
		}, Y * (J + 1)), 5 !== S.material.size && S.material.tween.to({
			size: 5
		}, Y * (J + 1)).start())); 
		
		S.geometry.vertices.forEach(function(e, i) {
			
			var n = S.geometry.colors[i],
				r = i % t.vertices.length,
				o = t.vertices[r],
				a = t.colors[r] || new THREE.Color("hsl(" + (160 + 3 * Math.random()) + ", 100%, 100%)"),
				s = [n.r, n.g, n.b],
				c = [a.r - s[0], a.g - s[1], a.b - s[2]];
			e.tweenvtx || (e.tweenvtx = new TWEEN.Tween(e).easing(TWEEN.Easing.Exponential.In).onUpdate(function(e) {
				n.r = s[0] + c[0] * e, n.g = s[1] + c[1] * e, n.b = s[2] + c[2] * e
			}).onStart(function() {}).onComplete(function() {
				e.tweenvtx.isplaying = !1
			}), e.tweenvtx.isplaying = !1), e.tweenvtx.stop(), e.tweenvtx.isplaying = !0, e.tweenvtx.to({
				x: o.x,
				y: o.y,
				z: o.z
			}, Y).delay(J * Y * Math.random()).start()
		}), D || (D = new TWEEN.Tween(W).easing(TWEEN.Easing.Exponential.In), O = new TWEEN.Tween(W).easing(TWEEN.Easing.Exponential.In)), D.stop(), O.stop(), D.to({
			firefly: W.fireflyFAST
		}, .5 * Y * (J + 1)).chain(O), O.to({
			firefly: W.fireflySLOW
		}, .5 * Y * (J + 1)), D.start(), Y = 1e3, J = .5
	}

	function b() {
		if(q % models.length === models.length - 2) {
			
			var e = models[q % models.length],
				t = {
					x: 0,
					y: -150,
					z: 0
				};
			S.geometry.vertices.forEach(function(i, n) {
				if(!i.tweenvtx.isplaying) {
					var r = n % e.vertices.length,
						o = e.vertices[r],
						a = Math.sqrt(Math.pow(i.x - t.x, 2) + Math.pow(i.z - t.z, 2));
					i.y = o.y + Math.sin(a / 70 + Q) * a / 30
				}
			}), S.geometry.verticesNeedUpdate = !0, Q -= .015
		}
	}

	function _(e, t) {
		return Math.random() * (t - e) + e
	}
	var scene, E, M, T, S, A, R, L, P, C, I, U, N, D, O, B = window.innerWidth,
		F = window.innerHeight,
		z = window.innerWidth / 2,
		H = window.innerHeight / 2,
		G = 0,
		V = 0,
		k = 0,
		models = [],
		W = {
			firefly: .002,
			fireflySLOW: .002,
			fireflyFAST: .04,
			qrcode: .001,
			qrcodeFAST: .01,
			qrcodeSLOW: .001
		},
		X = !1,
		q = -1,
		Y = 1500,
		Z = !1,
		J = 1.7,
		Q = 0;
	main();
	window.toggleParticle = changeShape; //变换形状
	window.introBox = introBox;
	window.skipIntrobox = skipIntrobox;
	window.startStorm = y; //初始化的旋转
}();