# Procedural 15s soundtrack, 120 BPM, synced to the visual cuts. Pure stdlib.
import math, random, struct, wave
SR = 44100; DUR = 15.0; N = int(SR * DUR)
L = [0.0] * N; R = [0.0] * N
rnd = random.Random(7)
def add(t0, samples, amp=1.0, pan=0.0):
    i0 = int(t0 * SR); gl = amp * (1 - max(0, pan)); gr = amp * (1 + min(0, pan))
    for k, v in enumerate(samples):
        i = i0 + k
        if i >= N: break
        L[i] += v * gl; R[i] += v * gr
def kick(amp=.9):
    n = int(.42 * SR); out = []; ph = 0.0
    for k in range(n):
        t = k / SR; f = 45 + 120 * math.exp(-t * 28); ph += 2 * math.pi * f / SR
        out.append(math.sin(ph) * math.exp(-t * 9) * (1 if k > 30 else k / 30) + (rnd.random() * 2 - 1) * math.exp(-t * 90) * .3)
    return out
def hat(dur=.05, hp=.9):
    prev = 0.0; out = []
    for k in range(int(dur * SR)):
        x = rnd.random() * 2 - 1; y = x - prev * hp; prev = x
        out.append(y * math.exp(-k / SR * 70))
    return out
def clap():
    return [(rnd.random() * 2 - 1) * (math.exp(-k / SR * 28) + .6 * math.exp(-max(0, k / SR - .02) * 40) * (k / SR > .02)) for k in range(int(.22 * SR))]
def bass(f, dur, amp=.5):
    out = []
    for k in range(int(dur * SR)):
        t = k / SR; env = min(1, t * 200) * math.exp(-t * 3.2)
        v = math.sin(2 * math.pi * f * t) + .35 * math.sin(4 * math.pi * f * t + .5)
        out.append(math.tanh(v * 1.8) * env * amp)
    return out
def pluck(f, dur=.22):
    out = []
    for k in range(int(dur * SR)):
        t = k / SR; env = math.exp(-t * 16)
        out.append((math.sin(2 * math.pi * f * t) + .4 * math.sin(4 * math.pi * f * t) + .2 * math.sin(6 * math.pi * f * t)) * env)
    return out
def riser(dur):
    n = int(dur * SR); out = []; ph = 0.0; prev = 0.0
    for k in range(n):
        u = k / n; ph += 2 * math.pi * (200 + 2600 * u * u) / SR
        x = rnd.random() * 2 - 1; hpn = x - prev * (.5 + .45 * u); prev = x
        out.append((math.sin(ph) * .5 + hpn * .7) * u * u)
    return out
def impact():
    n = int(1.3 * SR); out = []; ph = 0.0
    for k in range(n):
        t = k / SR; ph += 2 * math.pi * (30 + 90 * math.exp(-t * 6)) / SR
        out.append(math.sin(ph) * math.exp(-t * 3.2) + (rnd.random() * 2 - 1) * math.exp(-t * 11) * .7)
    return out
def pad(freqs, dur):
    n = int(dur * SR); out = []
    for k in range(n):
        t = k / SR; env = min(1, t / .05) * math.exp(-t * .35)
        v = 0
        for f in freqs:
            for d in (-1.003, 1.003):
                v += ((2 * ((t * f * d) % 1) - 1) * .5 + math.sin(2 * math.pi * f * d * t) * .5)
        out.append(v / (len(freqs) * 2) * env)
    return out

K = kick(); H = hat(); CL = clap(); IM = impact()
beat = .5
# drums
for b in range(30):
    t = b * beat
    add(t, K, .85)
    add(t + beat / 2, H, .22, .2)
    if t >= 2.0:
        if b % 2 == 1: add(t, CL, .3)
        add(t + beat / 4, hat(.03), .12, -.25); add(t + beat * .75, hat(.03), .12, .25)
    if t >= 4.5: add(t + beat / 4, H, .1, .3)
# opening word slams
for t in (0.0, .5, 1.0): add(t, IM[:int(.6 * SR)], .4)
# bass line from 2s
notes = [55.0, 55.0, 65.41, 49.0]  # A1 A1 C2 G1
for b in range(4, 30):
    t = b * beat
    add(t + beat / 2, bass(notes[(b // 2) % 4], .4), .5)
    if b % 2 == 0: add(t, bass(notes[(b // 2) % 4], .45), .6)
# pluck arp in data + 3D + type scenes
scale = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99]
arp = [0, 2, 4, 2, 5, 4, 7, 4, 3, 5, 7, 9, 7, 5, 4, 2]
for i in range(int((12.0 - 4.5) / (beat / 2))):
    t = 4.5 + i * beat / 2
    add(t, pluck(scale[arp[i % 16]]), .17, ((i % 4) - 1.5) * .3)
# risers + impacts on cuts
for c in (2.0, 4.5, 7.0, 9.5, 12.0):
    add(c - 1.0, riser(1.0), .28)
    add(c, IM, .8 if c < 12 else 1.0)
# finale chord (Am add9) + name hits
add(12.0, pad([110.0, 220.0, 261.63, 329.63, 493.88], 3.0), .5)
add(12.6, IM[:int(.8 * SR)], .5)
for t in (13.0, 13.5, 14.0, 14.5): add(t, pluck(scale[[5, 7, 9, 8][int((t - 13) / .5)]] * 2, .5), .2)
# master
peak = max(max(abs(x) for x in L), max(abs(x) for x in R)) or 1
g = .9 / peak
fade_start = int((DUR - .35) * SR)
with wave.open('soundtrack.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    buf = bytearray()
    for i in range(N):
        f = 1.0 if i < fade_start else max(0.0, (N - i) / (N - fade_start))
        a = math.tanh(L[i] * g * 1.1) * f; b = math.tanh(R[i] * g * 1.1) * f
        buf += struct.pack('<hh', int(a * 32000), int(b * 32000))
    w.writeframes(bytes(buf))
print('ok')
