const btnWrapper = document.querySelector("#buttonWrapper");
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const btn = document.createElement("button");
  btn.innerText = "Button " + (i + 1);
  //   btn.addEventListener("click", () => {})
  //   document.body.append(btn);
  fragment.append(btn);
}
btnWrapper.append(fragment);

btnWrapper.addEventListener("click", (e) => {
  if (e.target.nodeName === "BUTTON") {
    console.log("You clicked " + e.target.innerText);
  }
});
