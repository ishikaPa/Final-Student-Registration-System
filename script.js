// ================== THEME TOGGLE ==================
document.getElementById("toggleTheme").addEventListener("change", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(
    "preferredTheme",
    document.body.classList.contains("dark-mode") ? "dark" : "light"
  );
});

window.addEventListener("DOMContentLoaded", () => {
  const preferred = localStorage.getItem("preferredTheme");
  if (preferred === "dark") {
    document.body.classList.add("dark-mode");
    document.getElementById("toggleTheme").checked = true;
  }
});

// ================== DOM ELEMENTS ==================
const form = document.getElementById("studentForm");
const studentTable = document.getElementById("studentTable");
const scrollTopBtn = document.getElementById("scrollTopBtn");
const toast = document.getElementById("toast");
const searchInput = document.getElementById("searchStudent");
const genderFilter = document.getElementById("filterGender");
const classFilter = document.getElementById("filterClass");

let editIndex = -1;
let students = JSON.parse(localStorage.getItem("students")) || [];

// ================== TOAST ==================
function showToast(message) {
  toast.textContent = message;
  toast.className = "show";
  setTimeout(() => (toast.className = toast.className.replace("show", "")), 3000);
}

// ================== STORAGE ==================
function saveToStorage() {
  localStorage.setItem("students", JSON.stringify(students));
}

// ================== RENDER STUDENTS ==================
function renderTable(data = students) {
  studentTable.innerHTML = "";
  const uniqueClasses = new Set();

  data.forEach((student, index) => {
    uniqueClasses.add(student.class);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><img src="${student.photo || "https://via.placeholder.com/40"}" alt="photo" width="40" height="40" style="border-radius:50%; object-fit:cover;"></td>
      <td>${student.name}</td>
      <td>${student.id}</td>
      <td>${student.email}</td>
      <td>${student.contact}</td>
      <td>${student.dob}</td>
      <td>${student.gender}</td>
      <td>${student.class}</td>
      <td>${student.address}</td>
      <td>
        <button class="btn edit-btn" onclick="editStudent(${index})"><i class="fas fa-edit"></i></button>
        <button class="btn delete-btn" onclick="deleteStudent(${index})"><i class="fas fa-trash"></i></button>
      </td>
    `;
    studentTable.appendChild(row);
  });

  // Populate filter class dropdown
  classFilter.innerHTML = '<option value="">All Classes</option>';
  uniqueClasses.forEach((cls) => {
    const option = document.createElement("option");
    option.textContent = cls;
    classFilter.appendChild(option);
  });
}

// ================== VALIDATION + SUBMIT ==================
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name");
  const studentId = document.getElementById("studentId");
  const email = document.getElementById("email");
  const contact = document.getElementById("contact");
  const dob = document.getElementById("dob");
  const gender = document.getElementById("gender");
  const studentClass = document.getElementById("class");
  const address = document.getElementById("address");
  const photo = document.getElementById("photo");

  const nameRegex = /^[a-zA-Z\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const contactRegex = /^[0-9]{10}$/;

  if (!name.value.trim() || !nameRegex.test(name.value)) {
    alert("Please enter a valid name (letters and spaces only)."), name.focus();
    return;
  }
  if (!studentId.value || Number(studentId.value) <= 0) {
    alert("Please enter a valid student ID."), studentId.focus();
    return;
  }
  if (!email.value || !emailRegex.test(email.value)) {
    alert("Please enter a valid email address."), email.focus();
    return;
  }
  if (!contact.value || !contactRegex.test(contact.value)) {
    alert("Please enter a valid 10-digit contact number."), contact.focus();
    return;
  }
  const selectedDate = new Date(dob.value);
  const today = new Date();
  if (!dob.value || selectedDate >= today) {
    alert("Please enter a valid DOB (not in the future)."), dob.focus();
    return;
  }
  if (!gender.value) {
    alert("Please select a gender."), gender.focus();
    return;
  }
  if (!studentClass.value.trim()) {
    alert("Please enter the class."), studentClass.focus();
    return;
  }
  if (!address.value.trim()) {
    alert("Please enter the address."), address.focus();
    return;
  }
  if (photo.files.length > 0) {
    const file = photo.files[0];
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Please upload a valid image."), photo.focus();
      return;
    }
  }

  const reader = new FileReader();
  reader.onload = function () {
    const studentData = {
      name: name.value.trim(),
      id: studentId.value.trim(),
      email: email.value.trim(),
      contact: contact.value.trim(),
      dob: dob.value,
      gender: gender.value,
      class: studentClass.value.trim(),
      address: address.value.trim(),
      photo: reader.result,
    };
    if (editIndex >= 0) {
      students[editIndex] = studentData;
      showToast("Student updated.");
      editIndex = -1;
    } else {
      students.push(studentData);
      showToast("Student registered.");
    }
    saveToStorage();
    renderTable();
    form.reset();
  };

  if (photo.files.length > 0) {
    reader.readAsDataURL(photo.files[0]);
  } else {
    reader.onload();
  }
});

// ================== DELETE ==================
function deleteStudent(index) {
  if (confirm("Are you sure you want to delete this student?")) {
    students.splice(index, 1);
    saveToStorage();
    renderTable();
    showToast("Student deleted.");
  }
}

// ================== EDIT ==================
function editStudent(index) {
  const s = students[index];
  document.getElementById("name").value = s.name;
  document.getElementById("studentId").value = s.id;
  document.getElementById("email").value = s.email;
  document.getElementById("contact").value = s.contact;
  document.getElementById("dob").value = s.dob;
  document.getElementById("gender").value = s.gender;
  document.getElementById("class").value = s.class;
  document.getElementById("address").value = s.address;
  editIndex = index;
  showToast("Editing student. Make changes and submit.");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ================== FILTERING ==================
function applyFilters() {
  const keyword = searchInput.value.toLowerCase();
  const gender = genderFilter.value;
  const classVal = classFilter.value.toLowerCase();

  const filtered = students.filter((s) => {
    const matchKeyword =
      s.name.toLowerCase().includes(keyword) ||
      s.id.toLowerCase().includes(keyword) ||
      s.email.toLowerCase().includes(keyword) ||
      s.class.toLowerCase().includes(keyword);

    const matchGender = gender === "" || s.gender === gender;
    const matchClass = classVal === "" || s.class.toLowerCase().includes(classVal);

    return matchKeyword && matchGender && matchClass;
  });

  renderTable(filtered);
}

searchInput.addEventListener("input", applyFilters);
genderFilter.addEventListener("change", applyFilters);
classFilter.addEventListener("change", applyFilters);

// ================== SCROLL TOP ==================
window.addEventListener("scroll", () => {
  scrollTopBtn.style.display = window.scrollY > 200 ? "block" : "none";
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ================== INIT ==================
renderTable();
