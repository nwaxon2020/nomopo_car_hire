// app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "../../../lib/firebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDoc
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  validIdNumber: string;
  profileImage: string;
  idImage: string;
  verified: boolean;
  createdAt: any;
  authMethod: string;
}

export default function AdminDashboard() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // STRICT ADMIN CHECK - FIXED VERSION
  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.replace("/admin/login");
        return;
      }

      try {
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        if (!adminDoc.exists() || !adminDoc.data().isAdmin) {
          // USER IS NOT ADMIN - FORCE LOGOUT AND REDIRECT
          setError("Access Denied: You are not an administrator");
          await signOut(auth);
          setTimeout(() => {
            router.replace("/admin/login");
          }, 2000);
          return;
        }
        // User is admin, continue loading dashboard
        fetchDrivers();
      } catch (error) {
        console.error("Admin check error:", error);
        setError("Error verifying admin access");
        await signOut(auth);
        setTimeout(() => {
          router.replace("/admin/login");
        }, 2000);
      }
    };

    checkAdmin();
  }, [router]);

  const fetchDrivers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "drivers"));
      const driversData: Driver[] = [];
      
      querySnapshot.forEach((doc) => {
        driversData.push({
          id: doc.id,
          ...doc.data()
        } as Driver);
      });

      setDrivers(driversData);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setError("Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (driverId: string, currentStatus: boolean) => {
    try {
      setUpdating(driverId);
      const driverRef = doc(db, "drivers", driverId);
      await updateDoc(driverRef, {
        verified: !currentStatus,
        updatedAt: new Date()
      });
      
      setDrivers(prev => prev.map(driver => 
        driver.id === driverId 
          ? { ...driver, verified: !currentStatus }
          : driver
      ));
      
      setSuccess(`Driver ${!currentStatus ? 'verified' : 'unverified'} successfully`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating verification:", error);
      setError("Failed to update verification status");
      setTimeout(() => setError(""), 3000);
    } finally {
      setUpdating(null);
    }
  };

  const deleteDriver = async (driver: Driver) => {
    if (!confirm(`Are you sure you want to delete ${driver.firstName} ${driver.lastName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(driver.id);

      // Delete images from Storage
      const storageDeletions = [];
      if (driver.profileImage && driver.profileImage !== "None") {
        const profileRef = ref(storage, `drivers/${driver.id}/profileImage.jpg`);
        storageDeletions.push(deleteObject(profileRef).catch(err => console.log("Profile delete error:", err)));
      }
      
      if (driver.idImage && driver.idImage !== "None") {
        const idRef = ref(storage, `drivers/${driver.id}/idImage.jpg`);
        storageDeletions.push(deleteObject(idRef).catch(err => console.log("ID delete error:", err)));
      }

      await Promise.allSettled(storageDeletions);

      // Delete from Firestore
      await deleteDoc(doc(db, "drivers", driver.id));

      // Remove from local state
      setDrivers(prev => prev.filter(d => d.id !== driver.id));
      
      setSuccess("Driver deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting driver:", error);
      setError("Failed to delete driver");
      setTimeout(() => setError(""), 3000);
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      setError("Logout failed");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading drivers...</div>
      </div>
    );
  }

  if (error && error.includes("Access Denied")) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-600 text-center">
            <div className="text-2xl mb-4">🚫 Access Denied</div>
            <p>{error}</p>
            <p className="mt-4 text-gray-600">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Admin</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      {(error || success) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Drivers</h3>
            <p className="text-3xl font-bold text-blue-600">{drivers.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Verified</h3>
            <p className="text-3xl font-bold text-green-600">
              {drivers.filter(d => d.verified).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {drivers.filter(d => !d.verified).length}
            </p>
          </div>
        </div>

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <div key={driver.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Profile Header */}
              <div className="bg-blue-600 p-4 text-white">
                <div className="flex items-center space-x-4">
                  <img
                    src={driver.profileImage || "/default-avatar.png"}
                    alt="Profile"
                    className="w-16 h-16 rounded-full border-2 border-white"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">
                      {driver.firstName} {driver.lastName}
                    </h3>
                    <p className="text-blue-100">{driver.email}</p>
                  </div>
                </div>
              </div>

              {/* Driver Details */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{driver.phone}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ID Number:</span>
                  <span className="font-medium">{driver.validIdNumber}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Auth Method:</span>
                  <span className="font-medium capitalize">{driver.authMethod}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Registered:</span>
                  <span className="font-medium">
                    {driver.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </span>
                </div>

                {/* ID Image Preview */}
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600 mb-2">ID Document:</p>
                  <img
                    src={driver.idImage || "/default-id.png"}
                    alt="ID Document"
                    className="w-full h-32 object-cover rounded border"
                    onClick={() => window.open(driver.idImage, '_blank')}
                    style={{ cursor: 'pointer' }}
                  />
                </div>

                {/* Verification Status */}
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-gray-600">Status:</span>
                  <button
                    onClick={() => toggleVerification(driver.id, driver.verified)}
                    disabled={updating === driver.id}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      driver.verified
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    } disabled:opacity-50`}
                  >
                    {updating === driver.id ? 'Updating...' : driver.verified ? 'Verified' : 'Not Verified'}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-2">
                <button
                  onClick={() => deleteDriver(driver)}
                  disabled={deleting === driver.id}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {deleting === driver.id ? 'Deleting...' : 'Delete Driver'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {drivers.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No drivers registered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}