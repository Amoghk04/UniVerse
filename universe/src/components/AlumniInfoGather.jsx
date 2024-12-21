import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AlumniInfoGather = () => {
  const [usn, setUsn] = useState('');
  const [yearPassOut, setYearPassOut] = useState('');
  const [companies, setCompanies] = useState(['']);
  const [skills, setSkills] = useState(['']);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();
  const username = localStorage.getItem('currentUsername');
  const name = localStorage.getItem('currentName');
  const email = localStorage.getItem('currentEmail');
  const password = localStorage.getItem('currentPassword');
  const isAlumni = localStorage.getItem('currentIsAlumni');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all fields are filled in
    if (!yearPassOut || companies.some(company => !company) || skills.some(skill => !skill)) {
      alert('Please fill in all fields');
      return;
    }

    // Prepare the data to send to the backend
    const data = {
      name,
      username,
      email,
      password,
      isAlumni,
      yearPassOut: parseInt(yearPassOut), // Convert year to an integer
      companies: companies.filter(company => company !== ''), // Remove empty companies
      skills: skills.filter(skill => skill !== '') // Remove empty skills
    };

    console.log(data);
    const url = 'http://127.0.0.1:5000/alumni/register'; // Updated the URL

    try {
      // Send data to backend (using correct URL)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Send the data as JSON
      });

      if (!response.ok) {
        throw new Error('Failed to submit data');
      }

      // Handle successful submission
      const result = await response.json();
      console.log('Data submitted successfully:', result);

      // Redirect to home page after submission
      navigate('/home');
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error submitting the form. Please try again.');
    }
  };


  const handleCompanyChange = (index, event) => {
    const newCompanies = [...companies];
    newCompanies[index] = event.target.value;
    setCompanies(newCompanies);
  };

  const handleSkillChange = (index, event) => {
    const newSkills = [...skills];
    newSkills[index] = event.target.value;
    setSkills(newSkills);
  };

  const addCompany = () => {
    setCompanies([...companies, '']);
  };

  const addSkill = () => {
    setSkills([...skills, '']);
  };

  const removeCompany = (index) => {
    const newCompanies = companies.filter((_, i) => i !== index);
    setCompanies(newCompanies);
  };

  const removeSkill = (index) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('theme', !darkMode ? 'dark' : 'light');
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-all duration-500 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}
    >
      {/* Theme Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 text-xl bg-black/40 p-2 rounded-full transition-colors hover:bg-gray-600 focus:outline-none"
      >
        {darkMode ? '🌙' : '🌞'}
      </button>

      <div
        className={`w-full max-w-md p-6 shadow-md rounded-lg transition-all ${darkMode ? 'bg-gray-800 border border-white/20' : 'bg-white border border-gray-300'}`}
      >
        <h2 className="text-3xl font-bold mb-4 text-center">Alumni Details</h2>
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="yearPassOut"
            className={`block mt-4 mb-2 text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}
          >
            Year of Passing:
          </label>
          <input
            type="number"
            id="yearPassOut"
            value={yearPassOut}
            onChange={(e) => setYearPassOut(e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${darkMode ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'}`}
            placeholder="Enter Year of Passing"
            required
          />

          <label
            htmlFor="companies"
            className={`block mt-4 mb-2 text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}
          >
            Companies Worked:
          </label>
          {companies.map((company, index) => (
            <div key={index} className="flex items-center mb-4">
              <input
                type="text"
                value={company}
                onChange={(e) => handleCompanyChange(index, e)}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${darkMode ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'}`}
                placeholder={`Company ${index + 1}`}
                required
              />
              <button
                type="button"
                onClick={() => removeCompany(index)}
                className="ml-2 text-red-600 hover:text-red-700"
              >
                ❌
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addCompany}
            className="mt-2 text-blue-600 hover:text-blue-700"
          >
            + Add Company
          </button>

          <label
            htmlFor="skills"
            className={`block mt-4 mb-2 text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}
          >
            Skills:
          </label>
          {skills.map((skill, index) => (
            <div key={index} className="flex items-center mb-4">
              <input
                type="text"
                value={skill}
                onChange={(e) => handleSkillChange(index, e)}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${darkMode ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-500' : 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'}`}
                placeholder={`Skill ${index + 1}`}
                required
              />
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="ml-2 text-red-600 hover:text-red-700"
              >
                ❌
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSkill}
            className="mt-2 text-blue-600 hover:text-blue-700"
          >
            + Add Skill
          </button>

          <button
            type="submit"
            className="w-full mt-6 py-2 px-4 bg-blue-600 text-white font-semibold rounded-md focus:outline-none focus:ring-2 hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AlumniInfoGather;
