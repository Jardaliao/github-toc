/**
 * content.js 内容生成脚本，只跑一次
 * 因为github使用turbo frame做业内导航
 */

const containerName = "toc-container";

log(`======= TOC content script..., ${window.location.href}`);

(async () => {

    // 1 注册turbo frame导航事件完成的监听器
    document.addEventListener('turbo:load', async function (event) {
        log(`turbo:load load`);
        // 1.1 从storage.sync中加载load参数  是否默认显示目录
        let { load } = await chrome.storage.sync.get(["load"])
        log(`===== load: ${load}`);
        if (load == null || load === undefined) load = true; // 如果没有设置，load默认为true
        if (!load) return;

        // 1.2 如果页面已存在，则删除
        removeContainer();

        // 1.3 插入一个新的container
        const { $tocContainer, $lastChild, success } = createContainer();
        if (!success) {
            return;
        }

        // 1.4 从dom中解析目录
        if (!(await extractTOC(load, $tocContainer, $lastChild))) {
            return;
        }

        // 1.5 为tocContainer注册吸顶 首次加载判断是否需要吸顶
        toggleSticky($lastChild, $tocContainer);
    });
})();

function removeContainer() {
    const $containerList = document.querySelectorAll(`div[name="${containerName}"]`);
    if ($containerList && $containerList.length) {
        log(`删除了已有的${$containerList.length}个tocContainer`);
        $containerList.forEach(($node, key, parent) => { $node.remove(); });
    }
}

function createContainer() {
    let $borderGrid = document.querySelector(".BorderGrid");
    if (!$borderGrid) {
        log(`===== none .BorderGrid`);
        return { success: false };
    }
    const $tocContainer = document.createElement("div");
    $tocContainer.setAttribute("name", containerName);
    $tocContainer.classList.add("BorderGrid-row");
    $borderGrid.insertAdjacentElement('beforeend', $tocContainer);
    const $lastChild = document.querySelector(".BorderGrid>*:nth-last-child(2)");

    return { $tocContainer, $lastChild, success: true };
}

async function extractTOC(load, $tocContainer, $lastChild) {
  const template = `
        <div class="BorderGrid-cell">
            <div id="github-toc" class="base ${load ? "on" : ""}">
                <div id="github-toc-btns"><span>Table of contents</span></div>
                __UL__
            </div>
        </div>
        `;

  // 选择所有含标题和链接的元素
  const headings = document.querySelectorAll(".markdown-heading"); // 选择 `.markdown-heading` 容器
  const $tocUl = document.createElement("ul"); // 创建目录容器

  // 遍历所有 `.markdown-heading`
  headings.forEach((markdownHeading) => {
    const headingElement = markdownHeading.querySelector(".heading-element"); // 查找标题
    const linkElement = markdownHeading.querySelector(":scope > a"); // 查找链接

    if (headingElement) {
      const listItem = document.createElement("li"); // 创建列表项
      const anchor = document.createElement("a"); // 创建 <a> 标签
      let href = ""; // 用于记录链接的 href
      const textContent = headingElement.textContent.trim(); // 提取标题文本

      // 如果存在链接，提取 href
      if (linkElement) {
        href = linkElement.getAttribute("href");
      }

      // 设置 <a> 的文本内容和跳转链接
      anchor.textContent = textContent;
      if (href) {
        anchor.setAttribute("href", href); // 设置 href
      }

      // 根据标题层级 h1, h2, h3... 设置缩进样式
      const tagName = headingElement.tagName.toLowerCase();
      const level = parseInt(tagName.replace("h", ""), 10); // 提取 h 后的数字
      listItem.style.paddingLeft = `${10 * level}px`; // 每层缩进增加 10px

      if (level === 1) {
        anchor.style.fontWeight = "bold"; // h1 文本加粗
      }

      listItem.appendChild(anchor); // 将 <a> 插入到 <li>
      $tocUl.appendChild(listItem); // 添加 <li> 到 <ul>
    }
  });

  // 将生成的目录嵌入 HTML
  $tocContainer.innerHTML = template.replace("__UL__", $tocUl.outerHTML);

  // 为 ul 标签固定宽高
  confirmUlSize($lastChild);
  return true;
}

function toggleSticky($lastChild, $tocContainer) {
    if (0 >= $lastChild.getBoundingClientRect().bottom) {
        $tocContainer.classList.add("sticky");
    } else {
        $tocContainer.classList.remove("sticky");
    }
    window.addEventListener("scroll", function () {
        const threshold = $lastChild.getBoundingClientRect().bottom;
        // log(`=======threshold: ${threshold}`);
        if (0 >= threshold) {
            $tocContainer.classList.add("sticky");
        } else {
            $tocContainer.classList.remove("sticky");
        }
    });
}

function confirmUlSize($lastChild) {
    // 为ul标签固定高度
    const $ul = document.querySelector("div[name=toc-container] ul");
    const top = $ul.getBoundingClientRect().top;
    log(`====last child bottom: ${$lastChild.getBoundingClientRect().bottom}`);
    log(`====ul top: ${top}`);
    if (top < $lastChild.getBoundingClientRect().bottom) {
        // 如果自己的top比上一个孩子的bottom还小
        $ul.style.setProperty("--gap", top);
    } else {
        $ul.style.setProperty("--gap", top - $lastChild.getBoundingClientRect().bottom);
    }
    // 再减去底部的空隙 让目录不要挨着底部
    const footerRec = document.querySelector("footer").getBoundingClientRect();
    const appMainRec = document.querySelector(".Layout-main").getBoundingClientRect();
    const bottomGap = footerRec.bottom - appMainRec.bottom;
    log(`==== footer.bottom: ${footerRec.bottom}, appMainRec.bottom: ${appMainRec.bottom}, bottom-gap: ${bottomGap}`);
    $ul.style.setProperty("--gap-bottom", bottomGap);

    // 为ul标签固定宽度
    const width = $lastChild.getBoundingClientRect().right - $lastChild.getBoundingClientRect().left;
    $ul.style.setProperty("--width", width);
}

function log(line) {
    // console.log(line)
}