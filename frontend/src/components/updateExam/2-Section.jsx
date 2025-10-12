import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom'

import axios from "../../utils/axiosConfig";
import { useAuth } from "../../context/AuthContext";

import SelectField from "../../components/SelectFields";
import CheckboxDropdown from "../../components/Checkbox_Dropdown";
import Button from "../../components/Buttons";

export const SectionCard = ({ sd, yearLevel, addedSelections, setAddedSelections }) => {
  const [sections, setSections] = useState([]);

  // Fetch all sections once
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await axios.get("/api/sections/year-section");
        setSections(res.data); // assumes [{section_id, section_name, course_id, year_number}, ...]
      } catch (err) {
        console.error("Error fetching sections:", err);
      }
    };
    fetchSections();
  }, []);

  // Handler for checkbox toggle
  const handleCheckbox = (sectionId) => {
    setAddedSelections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId) // remove
        : [...prev, sectionId] // add
    );
  };

  return (
    <div className="section-card">
      {sections
        .filter(
          (sec) =>
            sec.course_id === sd.course_id &&
            sec.year_number === Number(yearLevel)
        )
        .map((sec) => (
          <label key={sec.section_id}>
            <input
              type="checkbox"
              checked={addedSelections.includes(sec.section_id)}
              onChange={() => handleCheckbox(sec.section_id)}
            />
            {sec.section_name}
          </label>
        ))}
    </div>
  );
}

//=====================================================//
function SelectedSection({ setSelectedSectionName }) {
  const [sectionData, setSectionData] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("BSIT");
  const [selectedYear, setSelectedYear] = useState("1");
  const [selectedSections, setSelectedSections] = useState([{id: 1}]); //IDs from form
  const [dbSections, setDbSections] = useState([]); //fetched from DB

  const { accessToken } = useAuth();
  const { examId } = useParams();

  const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
    if (dbSections.length > 0) {
      setSelectedSectionName(
        `${dbSections[0].course_code} ${dbSections[0].year_number}-${dbSections[0].section_name}`
      );
    }
  }, [dbSections, setSelectedSectionName]);

  
//Fetch options
  useEffect(() => {
    const headers = { Authorization: `Bearer ${accessToken}` };
    const config = { headers, withCredentials: true };

    // Always fetch sectionData
    axios.get("/sections/year-section", config)
      .then((res) => setSectionData(res.data))
      .catch((err) => console.error("Failed to fetch:", err));

    // Fetch dbSections only when course is ready (not undefined)
    if (accessToken && examId && selectedCourse) {
      axios.get(`/exams/${examId}/sections`, {
        ...config,
        params: { courseCode: selectedCourse }
      })
        .then((res) => setDbSections(res.data))
        .catch(console.error);
    }
  }, [accessToken, examId, selectedCourse]);
  
  //Once both GET are loaded, set selected values
  // useEffect(() => {
  //   console.log("dbSections:", dbSections);

  //   if (dbSections.length > 0) {
  //     setSelectedSections(dbSections.map(s => ({ id: s.section_id })));
  //   }

  //   if (sectionData.length > 0 && dbSections[0]?.course_code) {
  //     setSelectedCourse(dbSections[0].course_code);
  //     setSelectedYear(dbSections[0].year_number);
  //   }

  // }, [sectionData, dbSections]);

  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!initialized && dbSections.length > 0) { //if !initialized {copies values from DB into your state}
      //run only once: load defaults from DB into state, then stop overwriting user changes (doing onChange in select course)
      setSelectedSections(dbSections.map(s => ({ id: s.section_id })));
      setSelectedCourse(dbSections[0].course_code);
      setSelectedYear(dbSections[0].year_number);
      setInitialized(true);
    }
  }, [dbSections, initialized]);

  const courseOptions = [...new Set(sectionData.map(d => d.course_code))]
    .map(c => ({ label: c, value: c }));

                  console.log("Option values:", courseOptions.map(o => o.value));

                  console.log("From DB:", dbSections[0]?.course_code);
                  
 
                  console.log("Selected course:", selectedCourse);
                  console.log("Raw DB sections:", dbSections);


  const yearOptions = [...new Set(sectionData
    .filter(d => d.course_code === selectedCourse)
    .map(d => d.year_number)
  )].map(y => ({ label: `${y} Year`, value: y }));

  const sectionOptions = sectionData
    .filter(d => d.course_code === selectedCourse && d.year_number === selectedYear);

  // Save/Add Section handler
  const handleSaveSections = async () => {
    if (isEditing) {    
      if (!selectedCourse || !selectedYear || selectedSections.length === 0) {
          alert("Please select course, year, and at least one section.");
          return;
        }

      try {
        const headers = { Authorization: `Bearer ${accessToken}` }
        const config = { headers, withCredentials: true };

        const sectionTakers = sectionOptions
          .filter((s) => selectedSections.some(sel => sel.id === s.section_id))
          .map((s) => (
            { 
              id: s.section_id, 
              name:`${s.course_code} ${s.year_number}-${s.section_name}` //saved as: BSIT 3-H
            }
          ));
                console.log("sectionOptions:", sectionOptions);
                console.log("selectedSections:", selectedSections);
                console.log("sectionTakers:", sectionTakers);

        await axios.put(`/exams/${examId}/sections`, { sections: sectionTakers }, config);
        const updated = await axios.get(`/exams/${examId}/sections`, config);  
        setDbSections(updated.data); // Keep DB state separate

        setIsEditing(false);
      } catch (err) {
        if (err.response?.status === 404) {
          console.warn("No sections assigned yet");
          setDbSections([]);
        } else {
          console.error("Error fetching sections:", err);
        }
        }
    } else {
      setIsEditing(true);
    }    
  };
  

  return (
    <>
      <label className="select-label">Select</label>
      <div className="dropdown-group">
        <SelectField
          className="department-dropdown"
          name="course"
          value={selectedCourse}
          onChange={(e) => {
            setSelectedCourse(e.target.value)
            setSelectedYear("");
            setSelectedSections([]);
          }}
          options={courseOptions}
          disabled={!selectedCourse || !isEditing}
        />
        <SelectField
          className="year-dropdown"
          name="year"
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(Number(e.target.value));
            setSelectedSections([]);
          }}
          options={yearOptions}
          disabled={!selectedCourse || !isEditing}
        />
        <div className="section-dropdown">
          <CheckboxDropdown
            options={sectionOptions.map((s) => ({
              value: s.section_id,
              label: s.section_name,
            }))}
            selected={selectedSections}
            onChange={setSelectedSections}
            placeholder="Select sections"
            disabled={!selectedYear || !isEditing}
          />
        </div>
      </div>

      <Button
        className="save-section-button"
        label={isEditing ? "Save Sec" : "Edit Sec"}
        disabled={!selectedCourse || !selectedYear || selectedSections.length === 0}
        onClick={handleSaveSections}
      />   
        
      {/* <!-- SECOND CONTAINER --> */}
      <div className="second-container">
        <label class="select-label">Selected Section</label>
        {dbSections.map((s) => (
          <p 
            key={s.section_id}
            onClick={() => setSelectedSectionName({
              id: s.section_id,
              name: `${s.course_code} ${s.year_number}-${s.section_name}`
            })} style={{ cursor: "pointer" }}
          >
            {`${s.course_code} ${s.year_number}-${s.section_name}`}
          </p>
        ))}
      </div>
    </>
  );
}


export default SelectedSection;