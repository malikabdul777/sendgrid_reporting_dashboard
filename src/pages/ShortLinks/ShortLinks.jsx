import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiExternalLink,
  FiMoreVertical,
  FiEye,
} from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import axiosInstance from "../../utils/axiosInstance";
import styles from "./ShortLinks.module.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

const ShortLinks = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({
    targetURL: "",
    customShortCode: "",
    title: "",
    description: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [submitting, setSubmitting] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);

  useEffect(() => {
    fetchLinks();
  }, [searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    if (pagination && pagination.currentPage > 1) {
      fetchLinks(pagination.currentPage);
    }
  }, [pagination?.currentPage]);

  const fetchLinks = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        sortBy,
        sortOrder,
      });

      const response = await axiosInstance.get(`/api/shortlinks?${params}`);

      if (response?.data?.status === "success") {
        setLinks(response.data?.data || []);
        setPagination(
          response.data?.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalResults: response.data?.count || 0,
            hasNextPage: false,
            hasPrevPage: false,
          }
        );
      }
    } catch (error) {
      console.error("Error fetching links:", error);
      toast.error("Failed to fetch short links");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingLink) {
        // Update existing link
        const response = await axiosInstance.put(
          `/api/shortlinks/${editingLink.shortCode}`,
          {
            newTargetURL: formData.targetURL,
            title: formData.title,
            description: formData.description,
          }
        );

        if (response?.data?.status === "success") {
          toast.success("Short link updated successfully");
          fetchLinks();
          resetForm();
        }
      } else {
        // Create new link
        const response = await axiosInstance.post("/api/shortlinks", formData);

        if (response?.data?.status === "success") {
          toast.success("Short link created successfully");
          fetchLinks();
          resetForm();
        }
      }
    } catch (error) {
      console.error("Error saving link:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to save short link";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (link) => {
    if (!link) return;

    setEditingLink(link);
    setFormData({
      targetURL: link.targetURL || "",
      customShortCode: link.shortCode || "",
      title: link.title || "",
      description: link.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (shortCode) => {
    if (!window.confirm("Are you sure you want to delete this short link?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/shortlinks/${shortCode}`);
      toast.success("Short link deleted successfully");
      fetchLinks();
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("Failed to delete short link");
    }
  };

  const handleCopyUrl = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl);
    toast.success("Short URL copied to clipboard");
  };

  const resetForm = () => {
    setFormData({
      targetURL: "",
      customShortCode: "",
      title: "",
      description: "",
    });
    setEditingLink(null);
    setShowModal(false);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleViewDetails = (link) => {
    setSelectedLink(link);
    setShowDetailsModal(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Short Links Management</h1>
        <button
          className={styles.createButton}
          onClick={() => setShowModal(true)}
        >
          <FiPlus size={16} />
          Create Short Link
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.sortContainer}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="createdAt">Created Date</option>
            <option value="clicks">Click Count</option>
            <option value="title">Title</option>
          </select>

          {/* <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select> */}
        </div>
      </div>

      {/* Links Table */}
      {loading ? (
        <div className={styles.loading}>
          <AiOutlineLoading3Quarters className={styles.spinner} size={24} />
          <span>Loading short links...</span>
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Short URL</th>
                  <th>Original URL</th>
                  <th>Clicks</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(links || []).map((link) => (
                  <tr key={link?._id || Math.random()}>
                    <td>
                      <div className={styles.titleCell}>
                        <span className={styles.title}>
                          {link?.title || "Untitled"}
                        </span>
                        {link?.description && (
                          <span className={styles.description}>
                            {link.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.urlCell}>
                        <span className={styles.shortUrl}>
                          {link?.shortLinkURL || ""}
                        </span>
                        <button
                          onClick={() =>
                            handleCopyUrl(link?.shortLinkURL || "")
                          }
                          className={styles.copyButton}
                          title="Copy URL"
                          disabled={!link?.shortLinkURL}
                        >
                          <FiCopy size={14} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className={styles.originalUrlCell}>
                        <span className={styles.originalUrl}>
                          {link?.targetURL || ""}
                        </span>
                        {link?.targetURL && (
                          <a
                            href={link.targetURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.externalLink}
                            title="Open original URL"
                          >
                            <FiExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={styles.clickCount}>
                        {link?.clicks || 0}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.status} ${styles.active}`}>
                        Active
                      </span>
                    </td>
                    <td>
                      <span className={styles.date}>
                        {link?.createdAt
                          ? new Date(link.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className={styles.actionButton}>
                            <FiMoreVertical size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(link)}
                          >
                            <FiEye size={14} />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleCopyUrl(link?.shortLinkURL || "")
                            }
                          >
                            <FiCopy size={14} />
                            Copy URL
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(link)}>
                            <FiEdit2 size={14} />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(link?.shortCode || "")}
                            className={styles.deleteMenuItem}
                          >
                            <FiTrash2 size={14} />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() =>
                  handlePageChange((pagination?.currentPage || 1) - 1)
                }
                disabled={!pagination?.hasPrevPage}
                className={styles.pageButton}
              >
                Previous
              </button>

              <span className={styles.pageInfo}>
                Page {pagination?.currentPage || 1} of{" "}
                {pagination?.totalPages || 1}
              </span>

              <button
                onClick={() =>
                  handlePageChange((pagination?.currentPage || 1) + 1)
                }
                disabled={!pagination?.hasNextPage}
                className={styles.pageButton}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editingLink ? "Edit Short Link" : "Create Short Link"}</h2>
              <button onClick={resetForm} className={styles.closeButton}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="targetURL">Target URL *</label>
                <input
                  type="url"
                  id="targetURL"
                  value={formData.targetURL}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      targetURL: e.target.value,
                    }))
                  }
                  required
                  placeholder="https://example.com"
                  className={styles.input}
                />
              </div>

              {!editingLink && (
                <div className={styles.formGroup}>
                  <label htmlFor="customShortCode">
                    Custom Short Code (Optional)
                  </label>
                  <input
                    type="text"
                    id="customShortCode"
                    value={formData.customShortCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customShortCode: e.target.value,
                      }))
                    }
                    placeholder="my-custom-code"
                    className={styles.input}
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="title">Title (Optional)</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Link title"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Link description"
                  className={styles.textarea}
                  rows={3}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={resetForm}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={styles.submitButton}
                >
                  {submitting ? (
                    <>
                      <AiOutlineLoading3Quarters
                        className={styles.spinner}
                        size={16}
                      />
                      {editingLink ? "Updating..." : "Creating..."}
                    </>
                  ) : editingLink ? (
                    "Update Link"
                  ) : (
                    "Create Link"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedLink && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Link Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <label>Title:</label>
                  <span>{selectedLink.title || "Untitled"}</span>
                </div>
                <div className={styles.detailItem}>
                  <label>Short URL:</label>
                  <div className={styles.urlWithCopy}>
                    <span className={styles.urlText}>
                      {selectedLink.shortLinkURL}
                    </span>
                    <button
                      onClick={() => handleCopyUrl(selectedLink.shortLinkURL)}
                      className={styles.copyButton}
                      title="Copy URL"
                    >
                      <FiCopy size={14} />
                    </button>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <label>Original URL:</label>
                  <div className={styles.urlWithCopy}>
                    <span className={styles.urlText}>
                      {selectedLink.targetURL}
                    </span>
                    <a
                      href={selectedLink.targetURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.externalLink}
                      title="Open original URL"
                    >
                      <FiExternalLink size={14} />
                    </a>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <label>Clicks:</label>
                  <span className={styles.clickCount}>
                    {selectedLink.clicks || 0}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <label>Status:</label>
                  <span
                    className={`${styles.status} ${
                      selectedLink.status === "active"
                        ? styles.active
                        : styles.inactive
                    }`}
                  >
                    {selectedLink.status
                      ? selectedLink.status.charAt(0).toUpperCase() +
                        selectedLink.status.slice(1)
                      : "Active"}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <label>Created:</label>
                  <span>
                    {selectedLink.createdAt
                      ? new Date(selectedLink.createdAt).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
                {selectedLink.description && (
                  <div className={styles.detailItem}>
                    <label>Description:</label>
                    <span>{selectedLink.description}</span>
                  </div>
                )}
                {selectedLink.shortCode && (
                  <div className={styles.detailItem}>
                    <label>Short Code:</label>
                    <span>{selectedLink.shortCode}</span>
                  </div>
                )}
              </div>
              <div className={styles.detailsActions}>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEdit(selectedLink);
                  }}
                  className={styles.editButton}
                >
                  <FiEdit2 size={14} />
                  Edit Link
                </button>
                <button
                  onClick={() => handleCopyUrl(selectedLink.shortLinkURL)}
                  className={styles.copyUrlButton}
                >
                  <FiCopy size={14} />
                  Copy URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShortLinks;
