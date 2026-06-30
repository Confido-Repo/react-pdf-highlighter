import { type Page, expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3003/react-pdf-highlighter/");
});

async function waitForHighlights(page: Page) {
  await page.waitForSelector(".Highlight .Highlight__part");
}

test("page loads", async ({ page }) => {
  await expect(page).toHaveTitle("react-pdf-highlighter");
});

test("should display highlights", async ({ page }) => {
  await waitForHighlights(page);
});

// CS-2396: text sitting under a highlight must be selectable AND copyable.
// Two regressions were involved:
//  1. the highlight layer paints above pdf.js's text layer, so `.Highlight__part`
//     intercepted the drag — fixed with `pointer-events: none` on it;
//  2. `textLayerMode: ENABLE_PERMISSIONS` made pdf.js's copy handler cancel the
//     native copy without writing the clipboard — fixed by using `ENABLE`.
test("should allow selecting and copying text underneath a highlight", async ({
  page,
}) => {
  await waitForHighlights(page);
  const part = page.locator(".Highlight .Highlight__part").first();
  const box = await part.boundingBox();
  if (!box) throw new Error("highlight part has no bounding box");

  // drag across the highlight — selection must reach the text layer beneath
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 2, y, { steps: 10 });
  await page.mouse.up();

  const result = await page.evaluate(() => {
    const selected = (window.getSelection()?.toString() ?? "").trim();
    // drive pdf.js's text-layer copy handler with a real DataTransfer and read
    // back what it writes — deterministic, no OS-clipboard permission needed
    const node =
      window.getSelection()?.anchorNode?.parentElement ?? document.body;
    const dt = new DataTransfer();
    node.dispatchEvent(
      new ClipboardEvent("copy", {
        clipboardData: dt,
        bubbles: true,
        cancelable: true,
      }),
    );
    return { selected, copied: dt.getData("text/plain").trim() };
  });

  expect(result.selected.length).toBeGreaterThan(0);
  expect(result.copied.length).toBeGreaterThan(0);
});
