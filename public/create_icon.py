#!/usr/bin/env python3
try:
    from PIL import Image, ImageDraw
    img = Image.new('RGB', (32, 32), color='#FF6B35')
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([(0, 0), (31, 31)], radius=4, fill='#FF6B35', outline='#000000', width=1)
    img.save('icon.png', 'PNG')
    print('PNG created')
except ImportError:
    print('PIL not available')
