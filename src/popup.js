(async () => {
    // 1 初始化 
    // 1.1 load参数 true/false 默认显示toc
    let load = true
    const result = await chrome.storage.sync.get(["load"])
    if (result && result.hasOwnProperty("load")) {
        // console.log(`===== load: ${result["load"]}`)
        load = result["load"]
    } else {
        await chrome.storage.sync.set({ load: true }) // 设置默认的load
    }

    const $load = document.getElementById("load")
    if (load) {
        $load.setAttribute("checked", load);
        document.getElementById("switch").classList.add("on");
    } else {
        $load.removeAttribute("checked");
    }
    
    $load.addEventListener("change", (event) => {
        "checked" in event?.target && chrome.storage.sync.set({ load: event.target.checked });
        document.getElementById("switch").classList.toggle("on");
    })

})();