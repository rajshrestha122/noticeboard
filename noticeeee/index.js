let currentRole = 'student';

        const users = {
            student: [
                { username: 'student123', password: 'password', name: 'John Doe', rollNo: 'CS001', department: 'Computer Science' }
            ],
            faculty: [
                { username: 'faculty123', password: 'password', name: 'Dr. Smith', department: 'Computer Science', subjects: ['Data Structures', 'Algorithms'] },
                { username: 'prof.johnson', password: 'password', name: 'Prof. Johnson', department: 'Electronics', subjects: ['Digital Electronics', 'Microprocessors'] }
            ],
            admin: [
                { username: 'admin123', password: 'password', name: 'Admin User' }
            ]
        };

        function switchRole(role) {
            currentRole = role;
            
            document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            document.querySelectorAll('[id$="Demo"]').forEach(demo => demo.classList.add('hidden'));
            document.getElementById(role + 'Demo').classList.remove('hidden');
            
            const departmentGroup = document.getElementById('departmentGroup');
            if (role === 'faculty') {
                departmentGroup.classList.remove('hidden');
            } else {
                departmentGroup.classList.add('hidden');
            }
            
            document.getElementById('loginForm').reset();
        }

        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const department = document.getElementById('department').value;
            
            const user = users[currentRole].find(u => u.username === username && u.password === password);
            
            if (user) {
                if (currentRole === 'faculty' && department && user.department !== department) {
                    alert('Invalid department selection');
                    return;
                }
                
                localStorage.setItem('currentUser', JSON.stringify({
                    ...user,
                    role: currentRole,
                    loginTime: new Date().toISOString()
                }));
                
                switch(currentRole) {
                    case 'student':
                        window.location.href = 'student-dashboard.html';
                        break;
                    case 'faculty':
                        window.location.href = 'faculty-dashboard.html';
                        break;
                    case 'admin':
                        window.location.href = 'admin-dashboard.html';
                        break;
                }
            } else {
                alert('Invalid credentials');
            }
        });

        if (!localStorage.getItem('collegeNotices')) {
            const sampleNotices = [
                {
                    id: 'notice_1',
                    title: 'Mid-Semester Examination Schedule',
                    content: 'The mid-semester examinations will be conducted from March 15-22, 2024. Students are advised to check the detailed timetable on the college website.',
                    category: 'Exam',
                    priority: 'high',
                    date: new Date().toISOString(),
                    author: 'Dr. Smith',
                    department: 'Computer Science',
                    targetAudience: 'all'
                },
                {
                    id: 'notice_2',
                    title: 'Data Structures Assignment Due',
                    content: 'Assignment on Binary Trees is due on March 10, 2024. Submit your solutions to the faculty office.',
                    category: 'Academic',
                    priority: 'medium',
                    date: new Date(Date.now() - 86400000).toISOString(),
                    author: 'Dr. Smith',
                    department: 'Computer Science',
                    subject: 'Data Structures',
                    targetAudience: 'department'
                }
            ];
            localStorage.setItem('collegeNotices', JSON.stringify(sampleNotices));
        }

        if (!localStorage.getItem('facultyData')) {
            const facultyData = [
                {
                    id: 'fac_1',
                    name: 'Dr. Smith',
                    department: 'Computer Science',
                    subjects: ['Data Structures', 'Algorithms', 'Database Systems'],
                    email: 'dr.smith@college.edu'
                },
                {
                    id: 'fac_2',
                    name: 'Prof. Johnson',
                    department: 'Electronics',
                    subjects: ['Digital Electronics', 'Microprocessors', 'VLSI Design'],
                    email: 'prof.johnson@college.edu'
                },
                {
                    id: 'fac_3',
                    name: 'Dr. Williams',
                    department: 'Mathematics',
                    subjects: ['Calculus', 'Linear Algebra', 'Statistics'],
                    email: 'dr.williams@college.edu'
                }
            ];
            localStorage.setItem('facultyData', JSON.stringify(facultyData));
        }