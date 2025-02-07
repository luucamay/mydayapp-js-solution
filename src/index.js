import "./css/base.css";

import {
  delegate,
  getURLHash,
  insertHTML,
  emptyElement,
} from "./js/helpers.js";
import { TodoStore } from "./js/store.js";

const Todos = new TodoStore("mydayapp-js");

const App = {
  $: {
    input: document.querySelector(".new-todo"),
    clear: document.querySelector(".clear-completed"),
    list: document.querySelector(".todo-list"),
    count: document.querySelector(".todo-count"),
    setActiveFilter: (filter) => {
      document
        .querySelectorAll(".filters a")
        .forEach((el) => el.classList.remove("selected")),
        document
          .querySelector(`.filters [href="#/${filter}"]`)
          .classList.add("selected");
    },
    showMain: (show) =>
      (document.querySelector(".main").style.display = show ? "block" : "none"),
    showClear: (show) =>
      (document.querySelector(".clear-completed").style.display = show
        ? "block"
        : "none"),
    showFooter: (show) =>
      (document.querySelector(".footer").style.display = show
        ? "block"
        : "none"),
    displayCount: (count) => {
      emptyElement(App.$.count);
      insertHTML(
        App.$.count,
        `
				<strong>${count}</strong>
				${count === 1 ? "item" : "items"} left
			`
      );
    },
  },
  init() {
    Todos.addEventListener("save", App.render);
    App.filter = getURLHash();
    window.addEventListener("hashchange", () => {
      App.filter = getURLHash();
      App.render();
    });
    App.$.input.addEventListener("keyup", (e) => {
      const title = e.target.value.trim();
      if (e.key === "Enter" && title) {
        Todos.add({
          title,
          completed: false,
          id: "id_" + Date.now(),
        });
        App.$.input.value = "";
      }
    });
    App.$.clear.addEventListener("click", () => {
      Todos.clearCompleted();
    });
    App.bindTodoEvents();
    App.render();
  },
  todoEvent(event, selector, handler) {
    delegate(App.$.list, selector, event, (e) => {
      let $el = e.target.closest("[data-id]");
      handler(Todos.get($el.dataset.id), $el, e);
    });
  },
  bindTodoEvents() {
    App.todoEvent("click", ".destroy", (todo) => Todos.remove(todo));
    App.todoEvent("click", ".toggle", (todo) => Todos.toggle(todo));
    App.todoEvent("dblclick", "label", (_, $li) => {
      $li.classList.add("editing");
      $li.querySelector(".edit").focus();
    });
    App.todoEvent("keyup", ".edit", (todo, $li, e) => {
      let $input = $li.querySelector(".edit");
      const newTitle = $input.value.trim();
      if (e.key === "Enter" && newTitle) {
        Todos.update({ ...todo, title: newTitle });
      }
      if (e.key === "Escape") {
        $input.value = todo.title;
        App.render();
      }
    });
    App.todoEvent("blur", ".edit", (todo, $li) => {
      const title = $li.querySelector(".edit").value;
      Todos.update({ ...todo, title });
    });
  },
  createTodoItem(todo) {
    const li = document.createElement("li");
    li.dataset.id = todo.id;
    if (todo.completed) {
      li.classList.add("completed");
    }
    insertHTML(
      li,
      `
			<div class="view">
				<input class="toggle" type="checkbox" ${todo.completed ? "checked" : ""}>
				<label></label>
				<button class="destroy"></button>
			</div>
			<input class="edit">
		`
    );
    li.querySelector("label").textContent = todo.title;
    li.querySelector(".edit").value = todo.title;
    return li;
  },
  render() {
    const count = Todos.all().length;
    App.$.setActiveFilter(App.filter);
    emptyElement(App.$.list);
    Todos.all(App.filter).forEach((todo) => {
      App.$.list.appendChild(App.createTodoItem(todo));
    });
    App.$.showMain(count);
    App.$.showFooter(count);
    App.$.showClear(Todos.hasCompleted());
    App.$.displayCount(Todos.all("active").length);
  },
};

App.init();
