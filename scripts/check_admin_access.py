import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(headless=True)
  c=await b.new_context(viewport={'width':1280,'height':1800})
  page=await c.new_page()
  minted=json.loads(Path('/root/.cache/lovable-auth/session.json').read_text())
  await page.goto('http://localhost:8080')
  await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[minted['storage_key'],json.dumps(minted['session'])])
  async def delay_roles(route):
   await asyncio.sleep(0.7)
   await route.continue_()
  await page.route('**/rest/v1/user_roles*', delay_roles)
  for path in ['/admin', '/admin/users']:
   await page.goto('http://localhost:8080'+path)
   for refresh in [False, True]:
    if refresh: await page.reload()
    await page.get_by_role('heading',name=('Carrier Verifications' if path == '/admin' else 'Users'),exact=True).wait_for()
    assert page.url == 'http://localhost:8080'+path, page.url
    if path == '/admin/users': await page.get_by_role('cell',name='k.lanaras@freight-share.com',exact=True).wait_for()
    print('PASS',path,'refresh' if refresh else 'direct link')
  await page.screenshot(path='/tmp/browser/admin/verified.png')
  await b.close()
asyncio.run(main())
