import { useState, useEffect } from "react";
import { authFetch } from "../utils/api";

export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    authFetch("/courses")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch courses");
        return res.json();
      })
      .then((data) => setCourses(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { courses, loading, error };
}

export function useCourse(id) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    authFetch(`/courses/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch course details");
        return res.json();
      })
      .then((data) => setCourse(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { course, loading, error };
}

export function useEnrolledCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnrolled = () => {
    authFetch("/courses/enrolled")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch enrolled courses");
        return res.json();
      })
      .then((data) => setEnrolledCourses(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEnrolled();
  }, []);

  return { enrolledCourses, loading, error, refetch: fetchEnrolled };
}
