from PIL import Image
import math

try:
    img = Image.open('favicon.jpeg').convert('RGBA')
    width, height = img.size
    pixels = img.load()

    bg_color = pixels[0, 0]
    tolerance = 45

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            distance = math.sqrt((r - bg_color[0])**2 + (g - bg_color[1])**2 + (b - bg_color[2])**2)
            if distance < tolerance:
                pixels[x, y] = (r, g, b, 0)
    
    img.save('favicon.png')
    print('Successfully generated favicon.png with transparent background')
except Exception as e:
    print(f'Error: {e}')
