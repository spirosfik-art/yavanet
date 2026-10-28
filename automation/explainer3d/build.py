# «יוונט מסביר» 3D: σκηνές Blender (Cycles) για reels εξήγησης.
#   blender -b -P build.py -- --episode ep.json --scene 3 --dur 5.2 --out dir --mode still|anim --tex texdir
# Στυλ: premium motion design — στρογγυλεμένα αντικείμενα, απαλό φως, βάθος πεδίου, navy/κρεμ/χρυσό.
import bpy, sys, json, math, os, argparse
from mathutils import Vector, Euler

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--episode"); ap.add_argument("--scene", type=int); ap.add_argument("--dur", type=float, default=5)
ap.add_argument("--out"); ap.add_argument("--mode", default="still"); ap.add_argument("--tex", default="tex")
ap.add_argument("--frames", default=""); ap.add_argument("--samples", type=int, default=0); ap.add_argument("--fps", type=int, default=30); ap.add_argument("--res", type=float, default=1.0)
A = ap.parse_args(argv)
EP = json.load(open(A.episode))
SC = EP["scenes"][A.scene]
FPS = A.fps
N = max(2, int(round(A.dur * FPS)))

def hexc(h, a=1.0):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4) for x in c) + (a,)
NAVY, DEEP, CREAM, GOLD, WHITE, SKY, RED = "#0B3A5B", "#061C2E", "#F3EBDD", "#F0B650", "#FFFFFF", "#2A8BC4", "#E0312B"

# ---------- βασικά ----------
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = "CYCLES"; s.cycles.device = "CPU"
    s.cycles.samples = A.samples or (96 if A.mode == "still" else 40)
    s.cycles.use_denoising = True
    try: s.cycles.denoiser = "OPENIMAGEDENOISE"
    except Exception: pass
    s.cycles.max_bounces = 6; s.cycles.caustics_reflective = False; s.cycles.caustics_refractive = False
    s.render.resolution_x = int(1080 * A.res); s.render.resolution_y = int(1920 * A.res); s.render.resolution_percentage = 100
    s.render.fps = FPS; s.frame_start = 1; s.frame_end = N
    try: s.view_settings.view_transform = "AgX"; s.view_settings.look = "AgX - Medium High Contrast"
    except Exception: s.view_settings.view_transform = "Filmic"
    s.render.film_transparent = False
    w = bpy.data.worlds.new("w"); s.world = w; w.use_nodes = True
    nt = w.node_tree; bg = nt.nodes["Background"]
    # ουρανός-διαβάθμιση για αντανακλάσεις
    tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ"); ramp = nt.nodes.new("ShaderNodeValToRGB")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0]); nt.links.new(sep.outputs["Z"], ramp.inputs[0])
    ramp.color_ramp.elements[0].color = hexc("#04121F"); ramp.color_ramp.elements[1].color = hexc("#3B6E96")
    nt.links.new(ramp.outputs[0], bg.inputs[0]); bg.inputs[1].default_value = .55
    hdr = os.path.join(A.tex, "studio.hdr")
    if os.path.exists(hdr):
        env = nt.nodes.new("ShaderNodeTexEnvironment"); env.image = bpy.data.images.load(hdr)
        bg2 = nt.nodes.new("ShaderNodeBackground"); nt.links.new(env.outputs[0], bg2.inputs[0]); bg2.inputs[1].default_value = .9
        lp = nt.nodes.new("ShaderNodeLightPath"); mix = nt.nodes.new("ShaderNodeMixShader")
        nt.links.new(lp.outputs["Is Camera Ray"], mix.inputs[0]); nt.links.new(bg2.outputs[0], mix.inputs[1]); nt.links.new(bg.outputs[0], mix.inputs[2])
        nt.links.new(mix.outputs[0], nt.nodes["World Output"].inputs[0])
    return s

MATS = {}
def mat(name, color, rough=.38, metal=0.0, emit=None, estr=0.0, coat=0.0, alpha=1.0, trans=0.0):
    key = (name, color, rough, metal, emit, estr, coat, alpha, trans)
    if key in MATS: return MATS[key]
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = hexc(color)
    b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    if coat: b.inputs["Coat Weight"].default_value = coat
    if trans: b.inputs["Transmission Weight"].default_value = trans
    if emit: b.inputs["Emission Color"].default_value = hexc(emit); b.inputs["Emission Strength"].default_value = estr
    if alpha < 1: b.inputs["Alpha"].default_value = alpha; m.blend_method = "BLEND"
    MATS[key] = m; return m

def imgmat(path, emit=0.6, rough=.25):
    m = bpy.data.materials.new("img"); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(path)
    nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    if emit: nt.links.new(t.outputs["Color"], b.inputs["Emission Color"]); b.inputs["Emission Strength"].default_value = emit
    b.inputs["Roughness"].default_value = rough
    return m

def link(o):
    bpy.context.collection.objects.link(o) if o.name not in bpy.context.collection.objects else None
    return o

def smooth(o, bevel=0.0, seg=6):
    for p in o.data.polygons: p.use_smooth = True
    if bevel:
        m = o.modifiers.new("b", "BEVEL"); m.width = bevel; m.segments = seg; m.limit_method = "ANGLE"
        try: m.harden_normals = True
        except Exception: pass
    return o

def box(size, loc=(0, 0, 0), m=None, bevel=.06, rot=(0, 0, 0), name="box"):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object; o.name = name; o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    smooth(o, bevel); o.data.materials.append(m or mat("c", CREAM)); return o

def cyl(r, h, loc=(0, 0, 0), m=None, bevel=.03, rot=(0, 0, 0), verts=64, name="cyl"):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=verts, location=loc, rotation=rot)
    o = bpy.context.active_object; o.name = name; smooth(o, bevel); o.data.materials.append(m or mat("c", CREAM)); return o

def cone(r1, r2, h, loc=(0, 0, 0), m=None, verts=48):
    bpy.ops.mesh.primitive_cone_add(radius1=r1, radius2=r2, depth=h, vertices=verts, location=loc)
    o = bpy.context.active_object; smooth(o, .01); o.data.materials.append(m or mat("c", CREAM)); return o

def sphere(r, loc=(0, 0, 0), m=None):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=48, ring_count=24)
    o = bpy.context.active_object; smooth(o); o.data.materials.append(m or mat("c", CREAM)); return o

def plane_img(path, w, h, loc, rot=(math.radians(90), 0, 0), emit=0.8, rough=.3):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object; o.scale = (w, h, 1)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(imgmat(path, emit, rough)); return o

def parent(child, par):
    child.parent = par; child.matrix_parent_inverse = par.matrix_world.inverted(); return child

def empty(loc=(0, 0, 0)):
    o = bpy.data.objects.new("e", None); link(o); o.location = loc; return o

def T(name): return os.path.join(A.tex, name)

# ---------- σκηνικό: καμπύλο φόντο (cyclorama) + φώτα ----------
def stage(col=NAVY, floor_z=0.0):
    bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, floor_z))
    fl = bpy.context.active_object; fl.data.materials.append(mat("floor", col, rough=.55))
    bpy.ops.mesh.primitive_cylinder_add(radius=14, depth=60, location=(0, 18, floor_z + 14), rotation=(0, math.radians(90), 0), vertices=96)
    wall = bpy.context.active_object; smooth(wall); wall.data.materials.append(mat("floor", col, rough=.55))
    # φώτα: θερμό κύριο, ψυχρό περίγραμμα, γέμισμα
    def area(loc, rot, energy, size, color):
        bpy.ops.object.light_add(type="AREA", location=loc, rotation=rot)
        L = bpy.context.active_object; L.data.energy = energy; L.data.size = size; L.data.color = color[:3]; return L
    area((-5, -6, 8), (math.radians(50), 0, math.radians(-35)), 1400, 6, hexc("#FFE7C4"))
    area((6, 3, 5), (math.radians(70), 0, math.radians(120)), 900, 3, hexc("#8FD0FF"))
    area((2, -9, 2), (math.radians(85), 0, math.radians(10)), 250, 8, hexc("#FFFFFF"))

def camera(loc_a, loc_b, target, lens=55, fstop=2.8, focus=None):
    cam_data = bpy.data.cameras.new("cam"); cam_data.lens = lens
    cam = bpy.data.objects.new("cam", cam_data); link(cam); bpy.context.scene.camera = cam
    tgt = empty(target)
    c = cam.constraints.new("TRACK_TO"); c.target = tgt; c.track_axis = "TRACK_NEGATIVE_Z"; c.up_axis = "UP_Y"
    cam_data.dof.use_dof = True; cam_data.dof.aperture_fstop = fstop; cam_data.dof.focus_object = focus or tgt
    key(cam, "location", 1, loc_a, "SINE"); key(cam, "location", N, loc_b, "SINE")
    return cam, tgt

def key(o, path, frame, value, interp="BEZIER", easing="EASE_IN_OUT"):
    setattr(o, path, value); o.keyframe_insert(data_path=path, frame=frame)
    if o.animation_data and o.animation_data.action:
        for fc in o.animation_data.action.fcurves:
            if fc.data_path == path:
                for kp in fc.keyframe_points:
                    if int(kp.co[0]) == frame: kp.interpolation = interp; kp.easing = easing

def pop(o, f0, dur=12, scale=1.0):  # εμφάνιση με αναπήδημα
    s = o.scale.copy() if scale == 1.0 else Vector((scale,) * 3)
    key(o, "scale", max(1, f0 - 1), (0.001, 0.001, 0.001), "BACK", "EASE_OUT")
    key(o, "scale", f0 + dur, tuple(s), "BACK", "EASE_OUT")

def fall(o, f0, z_from, dur=14):
    z = o.location.z
    key(o, "location", max(1, f0), (o.location.x, o.location.y, z_from), "BOUNCE", "EASE_OUT")
    key(o, "location", f0 + dur, (o.location.x, o.location.y, z), "BOUNCE", "EASE_OUT")

def spin(o, axis=2, turns=0.25, interp="SINE"):
    r0 = list(o.rotation_euler); r1 = list(r0); r1[axis] += turns * 2 * math.pi
    key(o, "rotation_euler", 1, tuple(r0), interp); key(o, "rotation_euler", N, tuple(r1), interp)

def F(t): return max(1, int(round(t * FPS)))  # δευτερόλεπτα → καρέ

# ---------- αντικείμενα ----------
def phone(loc, screen, rot=(0, 0, 0), scale=1.0):
    root = empty(loc); root.rotation_euler = rot
    body = box((1.5 * scale, 0.16 * scale, 3.1 * scale), loc, mat("phone", "#151A22", rough=.2, metal=.6, coat=1), bevel=.18 * scale)
    scr = plane_img(T(screen), 1.36 * scale, 2.92 * scale, (loc[0], loc[1] - .085 * scale, loc[2]), emit=1.2, rough=.08)
    parent(body, root); parent(scr, root); return root

def card(loc, tex, rot=(math.radians(90), 0, 0), w=1.7, h=1.08, thick=.03):
    root = empty(loc); root.rotation_euler = rot
    b = box((w, h, thick), loc, mat("card", "#FFFFFF", rough=.3, coat=.6), bevel=.05)
    face = plane_img(T(tex), w * .995, h * .995, (loc[0], loc[1], loc[2] + thick / 2 + .002), rot=(0, 0, 0), emit=.25, rough=.25)
    parent(b, root); parent(face, root); root.rotation_euler = rot; return root

def coin(loc):
    c = cyl(.32, .07, loc, mat("gold", GOLD, rough=.22, metal=1), bevel=.02, rot=(math.radians(90), 0, 0)); return c

def flag(path, loc, h=4.0, fw=1.9, fh=1.3):
    pole = cyl(.04, h, (loc[0], loc[1], loc[2] + h / 2), mat("pole", "#C9CED6", rough=.25, metal=1), bevel=.005)
    sphere(.08, (loc[0], loc[1], loc[2] + h + .05), mat("gold", GOLD, rough=.22, metal=1))
    bpy.ops.mesh.primitive_plane_add(size=1, location=(loc[0] + fw / 2 + .04, loc[1], loc[2] + h - fh / 2 - .1), rotation=(math.radians(90), 0, 0))
    f = bpy.context.active_object; f.scale = (fw, fh, 1); bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.subdivide(number_cuts=24); bpy.ops.object.mode_set(mode="OBJECT")
    f.data.materials.append(imgmat(path, .15, .6))
    m = f.modifiers.new("wave", "WAVE"); m.height = .07; m.width = .9; m.speed = .12; m.use_normal = False; m.narrowness = 1.2
    m.start_position_x = loc[0]; m.falloff_radius = 0
    sw = f.modifiers.new("s", "SUBSURF"); sw.levels = 1; sw.render_levels = 1
    for p in f.data.polygons: p.use_smooth = True
    return f

def person(loc, body_col, rot_z=0.0, h=1.0):
    root = empty(loc); root.rotation_euler = (0, 0, rot_z)
    b = cyl(.32 * h, 1.0 * h, (loc[0], loc[1], loc[2] + .62 * h), mat("pb" + body_col, body_col, rough=.5), bevel=.12 * h)
    hd = sphere(.27 * h, (loc[0], loc[1], loc[2] + 1.42 * h), mat("skin", "#E8C7A8", rough=.55))
    parent(b, root); parent(hd, root); return root

def ballot_box(loc, s=1.0, col="#7DB6E0"):
    root = empty(loc)
    b = box((1.4 * s, 1.0 * s, 1.1 * s), (loc[0], loc[1], loc[2] + .55 * s), mat("bb" + col, col, rough=.6), bevel=.05 * s)
    lid = box((1.48 * s, 1.08 * s, .08 * s), (loc[0], loc[1], loc[2] + 1.14 * s), mat("bbl", "#5A97C4", rough=.55), bevel=.03 * s)
    slot = box((.7 * s, .08 * s, .05 * s), (loc[0], loc[1], loc[2] + 1.19 * s), mat("slot", "#0A1420", rough=.9), bevel=.01 * s)
    for o in (b, lid, slot): parent(o, root)
    return root

def envelope(loc, rot=(0, 0, 0), s=1.0, col="#F7F1E4"):
    root = empty(loc); root.rotation_euler = rot
    e = box((.9 * s, .02 * s, .6 * s), loc, mat("env" + col, col, rough=.55), bevel=.01)
    fl = box((.88 * s, .021 * s, .3 * s), (loc[0], loc[1] - .002, loc[2] + .12 * s), mat("envf", "#E9DFC8", rough=.6), bevel=.005, rot=(0, math.radians(0), 0))
    parent(e, root); parent(fl, root); return root

# ---------- σκηνές ----------
def s_phone_bank():
    stage(); ph = phone((0, 0, 3.2), "bank.png", rot=(math.radians(8), 0, math.radians(-18)))
    pop(ph, 2, 16)
    spin(ph, 2, .06)
    for i, (x, z) in enumerate([(-.95, 4.75), (1.0, 4.45), (-1.0, 1.95), (.95, 1.7), (0.05, 5.05)]):
        c = coin((x, -.6, z)); c.rotation_euler = (math.radians(90), math.radians(20 * i), math.radians(30 * i)); pop(c, F(.4 + .15 * i), 10); spin(c, 1, .5)
    camera((1.2, -8.2, 3.9), (0.4, -7.2, 3.5), (0, 0, 3.2), lens=60, fstop=2.0, focus=ph)

def s_bank_card():
    stage(); cd = card((0, 0, 3.3), "card.png", rot=(math.radians(80), math.radians(-10), math.radians(-20)), w=2.4, h=1.52)
    key(cd, "location", 1, (-3, 0, 3.0), "BACK", "EASE_OUT"); key(cd, "location", F(.8), (0, 0, 3.3), "BACK", "EASE_OUT")
    spin(cd, 2, .05)
    ph = phone((2.0, 1.5, 2.6), "bank_ok.png", rot=(math.radians(5), 0, math.radians(-30)), scale=.8); pop(ph, F(.6), 14)
    camera((-.5, -11, 4.2), (.4, -10, 3.8), (.5, .4, 3.0), lens=55, fstop=2.4, focus=cd)

def s_id_card():
    stage(); cd = card((0, 0, 3.2), "id.png", rot=(math.radians(85), 0, math.radians(-12)), w=2.6, h=1.65); pop(cd, 2, 14)
    # γραμμή σάρωσης
    bar = box((2.9, .02, .05), (0, -.12, 4.2), mat("scan", "#7CFFB2", emit="#7CFFB2", estr=12), bevel=.0)
    key(bar, "location", F(.5), (0, -.12, 4.2), "SINE"); key(bar, "location", N, (0, -.12, 2.2), "SINE")
    camera((0, -10, 3.6), (.6, -9.2, 3.4), (0, 0, 3.2), lens=60, fstop=2.0, focus=cd)

def s_ballot():
    stage("#0D3350")
    for i, (x, r) in enumerate([(-1.45, 32), (0, 0), (1.45, -32)]):
        p = box((1.4, .06, 2.3), (x * .95, 1.0 - abs(x) * .38, 2.45), mat("booth", "#4F8FC0", rough=.55), bevel=.025, rot=(0, 0, math.radians(r)))
        pop(p, 1 + i * 3, 12)
    top = box((4.2, .9, .12), (0, .75, 3.66), mat("bt", NAVY, rough=.4), bevel=.04); pop(top, 6, 10)
    sign = plane_img(T("kalpi.png"), 1.3, .55, (0, .95, 2.9), emit=.4); pop(sign, 8, 10)
    tbl = box((2.6, 1.2, .1), (0, -.55, 1.2), mat("tbl", "#E9DFC8", rough=.6), bevel=.03)
    for lx in (-1.2, 1.2):
        for ly in (-1.05, -.05): box((.07, .07, 1.2), (lx, ly, .6), mat("pole", "#C9CED6", rough=.25, metal=1), bevel=.01)
    bb = ballot_box((0, -.55, 1.25), .9); pop(bb, F(.3), 14)
    env = envelope((0, -.55, 3.8), s=.8)
    key(env, "location", F(.6), (0, -.55, 3.8), "SINE"); key(env, "location", F(min(A.dur - .4, 2.2)), (0, -.55, 2.45), "SINE", "EASE_IN")
    camera((2.4, -8.4, 3.6), (1.3, -7.6, 3.2), (0, -.2, 2.1), lens=48, fstop=2.8, focus=bb)

def s_home():
    stage("#13314A")
    # δωμάτιο σε τομή
    box((7, 7, .2), (0, 0, .1), mat("fl2", "#C9A47A", rough=.6), bevel=.03)
    box((7, .2, 4), (0, 3.5, 2.1), mat("wall", CREAM, rough=.8), bevel=.03)
    box((.2, 7, 4), (-3.5, 0, 2.1), mat("wall2", "#E7DCC8", rough=.8), bevel=.03)
    # καναπές
    box((3.2, 1.2, .55), (0, 2.2, .55), mat("sofa", NAVY, rough=.7), bevel=.18)
    box((3.2, .4, 1.2), (0, 2.75, .95), mat("sofa", NAVY, rough=.7), bevel=.18)
    lamp = cyl(.05, 2.2, (2.6, 2.6, 1.3), mat("pole", "#C9CED6", rough=.25, metal=1)); cone(.45, .25, .5, (2.6, 2.6, 2.5), mat("shade", "#FFE7C4", emit="#FFD08A", estr=3))
    a = person((-.3, 2.0, .8), SKY, 0, 1.0); pop(a, 2, 12)
    ph = box((.22, .03, .4), (-.15, 1.55, 1.75), mat("scr", "#9FD4FF", emit="#9FD4FF", estr=6), bevel=.02); pop(ph, F(.3), 8)
    b = person((1.0, 1.1, .3), RED, math.radians(-20), 1.15); pop(b, F(.9), 14)
    camera((5.5, -7.5, 5.2), (4.2, -6.8, 4.4), (0, 1.5, 1.4), lens=40, fstop=4, focus=a)

def s_tallinn():
    stage("#0D3350")
    m_wall = mat("stone", "#D8CBB4", rough=.85); m_roof = mat("roof", "#B5452E", rough=.6); m_dark = mat("roofd", "#2E4A3A", rough=.5)
    box((9, 6, .3), (0, 0, .15), mat("grass", "#5E8A5B", rough=.9), bevel=.08)
    for i, x in enumerate([-3, -1.5, 0, 1.5, 3]):  # τείχος με επάλξεις
        w = box((1.5, .5, 1.4), (x, 1.6, 1.0), m_wall, bevel=.03); pop(w, 1 + i * 2, 10)
        for k in (-.5, 0, .5): box((.3, .5, .3), (x + k, 1.6, 1.85), m_wall, bevel=.02)
    for i, (x, y, r, h) in enumerate([(-3.8, 1.6, .55, 2.4), (3.8, 1.6, .6, 2.8), (-1.5, -1.0, .45, 2.0), (1.8, -.8, .5, 2.2)]):
        t = cyl(r, h, (x, y, .3 + h / 2), m_wall, bevel=.02); c = cone(r * 1.15, 0, h * .7, (x, y, .3 + h + h * .35), m_roof)
        pop(t, F(.2 + .15 * i), 12); pop(c, F(.35 + .15 * i), 12)
    sp = cyl(.45, 3.2, (.3, .2, 1.9), m_wall); sc = cone(.5, 0, 3.0, (.3, .2, 5.0), m_dark); pop(sp, F(.5), 12); pop(sc, F(.65), 14)
    for i in range(6):
        hx = -2.6 + i * 1.05; hh = 1.0 + (i % 3) * .3
        hs = box((.9, .9, hh), (hx, -2.3, .3 + hh / 2), mat("house" + str(i % 3), ["#F2D7A0", "#E8B9A4", "#CFE0D2"][i % 3], rough=.7), bevel=.03)
        rf = cone(.72, 0, .6, (hx, -2.3, .3 + hh + .3), m_roof, verts=4); rf.rotation_euler = (0, 0, math.radians(45)); pop(rf, F(.3 + .1 * i), 10)
    flag(T("flag_ee.png"), (3.3, -1.0, .3), h=3.6)
    camera((6.5, -12.5, 6.0), (4.8, -11.8, 5.2), (.4, 0, 2.0), lens=34, fstop=5.6)

def s_laptop():
    stage()
    base = box((3.4, 2.3, .12), (0, 0, 1.5), mat("alu", "#B9C2CC", rough=.25, metal=1), bevel=.05)
    lid = empty((0, 1.12, 1.56))
    sc = box((3.4, .1, 2.2), (0, 1.12, 2.66), mat("alu", "#B9C2CC", rough=.25, metal=1), bevel=.05); parent(sc, lid)
    disp = plane_img(T("laptop.png"), 3.2, 2.0, (0, 1.06, 2.66), emit=1.2, rough=.1); parent(disp, lid)
    lid.rotation_euler = (math.radians(-12), 0, 0)
    key(lid, "rotation_euler", 1, (math.radians(85), 0, 0), "BACK", "EASE_OUT"); key(lid, "rotation_euler", F(1.0), (math.radians(-12), 0, 0), "BACK", "EASE_OUT")
    rd = box((.9, .6, .25), (2.6, -.8, 1.15), mat("reader", "#1B2533", rough=.4), bevel=.06)
    cd = card((2.6, -.8, 1.55), "id_ee.png", rot=(math.radians(15), 0, math.radians(-10)), w=.85, h=.54)
    key(cd, "location", 1, (2.6, -.8, 2.6), "SINE"); key(cd, "location", F(.9), (2.6, -.8, 1.4), "SINE")
    camera((3.5, -8.5, 4.5), (2.5, -7.8, 4.0), (.6, .3, 2.2), lens=45, fstop=3.2, focus=base)

def s_bars():
    stage()
    data = [("2007", 5.5), ("2011", 24.3), ("2015", 30.5), ("2019", 43.8), ("2023", 51.1)]
    for i, (yr, v) in enumerate(data):
        x = -3.2 + i * 1.6; h = v / 12
        col = GOLD if i == 4 else "#4F8FC0"
        b = box((1.0, 1.0, h), (x, 0, h / 2), mat("bar" + str(i == 4), col, rough=.3, metal=.8 if i == 4 else 0, coat=.5), bevel=.08)
        b.scale = (1, 1, 1); key(b, "scale", F(.2 + .25 * i), (1, 1, .001), "BACK", "EASE_OUT"); key(b, "scale", F(.2 + .25 * i) + 18, (1, 1, 1), "BACK", "EASE_OUT")
        bpy.ops.object.text_add(location=(x, -.7, .05), rotation=(math.radians(90), 0, 0)); t = bpy.context.active_object
        t.data.body = yr; t.data.align_x = "CENTER"; t.data.size = .45; t.data.extrude = .03; t.data.materials.append(mat("txt", CREAM, rough=.4))
    camera((3, -12, 5.5), (1.5, -11, 4.5), (0, 0, 2.2), lens=42, fstop=4)

def s_parliament():
    stage("#0D3350")
    m = mat("stone", "#E6DCC8", rough=.75)
    box((8, 4, .6), (0, 0, .3), m, bevel=.05)
    box((7, 3.2, 2.4), (0, 0, 1.8), m, bevel=.05)
    for i in range(15):
        c = box((.18, .2, 2.5), (-3.3 + i * .47, -1.65, 1.85), mat("col", "#F6F0E4", rough=.6), bevel=.03); pop(c, F(.1 + .04 * i), 8)
    box((7.4, 3.6, .25), (0, 0, 3.1), m, bevel=.04)
    flag(T("flag_il.png"), (4.6, -2.2, .6), h=4.2)
    camera((6, -13, 4.5), (4.5, -12, 3.8), (0, 0, 2.2), lens=40, fstop=5)

def s_recount():
    stage()
    k = 0
    for r in range(5):
        for c in range(10):
            bb = ballot_box((-4.5 + c * 1.0, -1 + r * 1.1, 0), .55); pop(bb, F(.1) + k, 10); k += 1
    camera((0, -14, 9), (0, -12, 6.5), (0, 1.0, .6), lens=45, fstop=6)

def s_greek_mail():
    stage()
    yb = "#F2C300"
    box((1.4, 1.0, 2.0), (0, 0, 1.9), mat("mail", yb, rough=.35, coat=.6), bevel=.12)
    cyl(.72, 1.0, (0, 0, 2.9), mat("mail", yb, rough=.35, coat=.6), rot=(math.radians(90), 0, 0))
    box((.8, .1, .08), (0, -.52, 2.5), mat("slot", "#2A2A2A", rough=.8), bevel=.02)
    cyl(.12, .9, (0, 0, .45), mat("pole", "#5C6670", rough=.4, metal=.8))
    for i in range(5):
        e = envelope((-2.5 + i * .3, -1.5, 5.5 + i * .5), rot=(math.radians(10 * i), 0, math.radians(20 - 10 * i)), s=.7)
        key(e, "location", F(.3 * i + .1), (-2.5 + i * 1.2, -1.5, 6 + i * .3), "SINE")
        key(e, "location", F(.3 * i + 1.3), (0, -.6, 2.5), "SINE", "EASE_IN")
        key(e, "scale", F(.3 * i + 1.2), (1, 1, 1)); key(e, "scale", F(.3 * i + 1.35), (.01, .01, .01))
    flag(T("flag_gr.png"), (3.0, 1.2, 0), h=4.6)
    camera((3.2, -10, 3.6), (2.0, -9, 3.2), (.6, 0, 2.6), lens=45, fstop=3.5)

LOGO_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M150 112H232Q262 112 262 142V392H206V168H150Q134 168 134 152V128Q134 112 150 112Z" fill="#ffffff"/><path d="M318 112H382Q414 112 414 144V168Q414 224 360 262L334 228Q358 210 364 188H318Q302 188 302 172V128Q302 112 318 112Z" fill="#F0B650"/></svg>"""
def s_logo():
    stage(DEEP)
    import addon_utils
    try: addon_utils.enable("io_curve_svg", default_set=True)
    except Exception: pass
    root = empty((0, 0, 3.0))
    bg = box((3.2, .4, 3.2), (0, 0, 3.0), mat("lg", NAVY, rough=.22, coat=1), bevel=.6); parent(bg, root)
    svg = os.path.join(A.out, "logo.svg"); open(svg, "w").write(LOGO_SVG)
    before = set(bpy.data.objects)
    bpy.ops.import_curve.svg(filepath=svg)
    curves = [o for o in bpy.data.objects if o not in before and o.type == "CURVE"]
    mats = [mat("lw", "#FFFFFF", rough=.3, coat=.6), mat("gold", GOLD, rough=.2, metal=1)]
    for k, c in enumerate(curves):
        c.data.extrude = .0016; c.data.bevel_depth = .0005; c.data.bevel_resolution = 4
        c.data.materials.clear(); c.data.materials.append(mats[0] if k == 0 else mats[1])
        c.rotation_euler = (math.radians(90), 0, 0)
    bpy.context.view_layer.update()
    # κοινό πλαίσιο όλων των σχημάτων → κλίμακα και κεντράρισμα πάνω στο πλακίδιο
    pts = [c.matrix_world @ Vector(v) for c in curves for v in c.bound_box]
    mnx, mxx = min(p.x for p in pts), max(p.x for p in pts); mnz, mxz = min(p.z for p in pts), max(p.z for p in pts)
    k = 1.75 / max(mxx - mnx, mxz - mnz); cx, cz = (mnx + mxx) / 2, (mnz + mxz) / 2
    for c in curves:
        c.scale = (k, k, k); c.location = ((c.location.x - cx) * k, -.24, 3.0 + .25 + (c.location.z - cz) * k)
        parent(c, root)
    # κύμα
    bpy.ops.curve.primitive_bezier_curve_add(location=(0, 0, 0)); wv = bpy.context.active_object
    wv.data.bevel_depth = .07; wv.data.bevel_resolution = 6
    sp = wv.data.splines[0]; sp.bezier_points.add(2)
    pts = [(-1.0, -.26, 1.85), (-.2, -.26, 2.0), (.6, -.26, 1.85), (1.3, -.26, 2.0)]
    for bp_, p_ in zip(sp.bezier_points, pts): bp_.co = p_; bp_.handle_left_type = bp_.handle_right_type = "AUTO"
    wv.data.materials.append(mat("wave", SKY, rough=.3, coat=.5)); parent(wv, root)
    key(root, "rotation_euler", 1, (0, 0, math.radians(-60)), "BACK", "EASE_OUT"); key(root, "rotation_euler", F(1.2), (0, 0, 0), "BACK", "EASE_OUT")
    pop(root, 1, 16)
    camera((0, -10, 3.3), (0, -9.2, 3.1), (0, 0, 3.0), lens=55, fstop=2.0, focus=bg)

SCENES = {"phone_bank": s_phone_bank, "bank_card": s_bank_card, "id_card": s_id_card, "ballot": s_ballot, "home": s_home, "tallinn": s_tallinn,
          "laptop": s_laptop, "bars": s_bars, "parliament": s_parliament, "recount": s_recount, "greek_mail": s_greek_mail, "logo": s_logo}

s = reset()
SCENES[SC["s3d"]]()
os.makedirs(A.out, exist_ok=True)
if A.mode == "still":
    s.frame_set(int(N * .6)); s.render.image_settings.file_format = "JPEG"; s.render.image_settings.quality = 90
    s.render.filepath = os.path.join(A.out, f"still{A.scene:02d}.jpg"); bpy.ops.render.render(write_still=True)
elif A.frames:  # συγκεκριμένα καρέ (μοίρασμα σε πολλές μηχανές)
    s.render.image_settings.file_format = "JPEG"; s.render.image_settings.quality = 93
    for f in [int(x) for x in A.frames.split(",") if x]:
        s.frame_set(f); s.render.filepath = os.path.join(A.out, f"s{A.scene:02d}_{f:04d}.jpg"); bpy.ops.render.render(write_still=True)
else:
    s.render.image_settings.file_format = "PNG"; s.render.image_settings.color_mode = "RGB"
    s.render.filepath = os.path.join(A.out, f"s{A.scene:02d}_"); bpy.ops.render.render(animation=True)
print("DONE", A.scene, SC["s3d"])
