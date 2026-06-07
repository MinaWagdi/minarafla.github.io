/**
 * TILs ("Today I Learned") Data
 *
 * Small, daily posts about things I'm learning. Unlike the blog, TILs do NOT have
 * a page each — they all live inline on tils.html (and the 3 latest preview on the
 * homepage). Each TIL is one block in this array.
 *
 * Fields:
 *   date    - 'YYYY-MM-DD'. The feed sorts newest-first; no need to order by hand.
 *   title   - short heading
 *   content - the body as an HTML string (use <p>, <ul>, <code>, <pre>, <a>, ...).
 *             Math written with $...$ / $$...$$ renders via KaTeX on tils.html.
 *   image   - (optional) lead image path from the site root, e.g. 'tils/images/foo.png'
 *
 * To add a TIL: copy a block, change the fields. To remove one: delete its block.
 */

const tilPosts = [
    {
        date: '2026-06-07',
        title: 'Move all zeros to the end of an array — O(n) time, O(1) space',
        // image: 'tils/images/putting_zeros_end_array.png',
        content: `
            <p>
                Given <code>[4, 2, 7, 0, 0, 8]</code>, move every zero to the end
                <strong>in place</strong> (O(1) extra space) in O(n) time.
            </p>
            <p>
                Two pointers: <code>l</code> marks where the next non-zero should go,
                <code>r</code> scans the array. When <code>arr[r]</code> is non-zero,
                swap it into <code>arr[l]</code> and advance <code>l</code>. Zeros get
                pushed to the end automatically.
            </p>
            <pre><code>arr = [4, 2, 7, 0, 0, 8]
l = 0  # next slot for a non-zero value

for r in range(len(arr)):
    if arr[r] != 0:
        arr[l], arr[r] = arr[r], arr[l]
        l += 1
# arr -> [4, 2, 7, 8, 0, 0]</code></pre>
            <p>O(n) time (single pass), O(1) extra space (swaps in place).</p>
            <img src="tils/images/putting_zeros_end_array.png" alt="Two pointers l and r moving through the array, swapping non-zeros to the front and pushing zeros to the end.">
        `
    },

];
