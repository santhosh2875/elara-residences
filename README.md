# ELARA · Sea Face Residences

A scroll site for three seafront residential towers linked by a sky pool. Choose a view for the hero film, find your floor on the tower drawing, and book a viewing.

"Elara" is a demo brand. The sizes, floors, drive times, address, phone and email are placeholders.

Plain HTML, CSS and JavaScript. No build step and no dependencies.

## Run it
```bash
python -m http.server 5181
```
Then open http://localhost:5181.

## Edit it
Everything you are likely to change is in `config.js`: the brand, the six views, the residences and their floors, the amenities, the location and the contact details.

## Media
- `assets/views/`: one looping clip and one still per view, named after the view's `file` value (for example `01-clouds.mp4` and `01-clouds.jpg`).
- `assets/gallery/`: one picture per amenity.

## Files
```
index.html      all sections
styles.css      all styles
config.js       all the content
script.js       the hero views
sections.js     floor finder, amenities, booking form, menu and scrolling
```
