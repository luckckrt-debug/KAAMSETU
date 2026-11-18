import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useWorkerState } from '../../src/state';
import { apiClient } from '@kaamsetu/api-client';
import { JobPostingData, WORKER_CATEGORIES } from '@kaamsetu/shared';

export default function WorkerJobsFeedScreen() {
  const router = useRouter();
  const { t, language } = useWorkerState();
  const [jobs, setJobs] = useState<JobPostingData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await apiClient.getJobs({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        status: 'OPEN',
      });
      if (res.success && res.jobs) {
        let filtered = res.jobs;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            j =>
              j.title.toLowerCase().includes(q) ||
              j.description.toLowerCase().includes(q) ||
              j.location.toLowerCase().includes(q)
          );
        }
        setJobs(filtered);
      }
    } catch (e) {
      console.warn('Error fetching jobs:', e);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.navJobs} (काम खोजें)</Text>
        <Text style={styles.headerSub}>Find genuine daily and contract work nearby</Text>

        {/* Search Input */}
        <View style={styles.searchBar}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            placeholder="Search electrician, plumber, location..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={{ color: '#94A3B8', fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Trade Category Horizontal Filter */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.pill, selectedCategory === 'all' && styles.pillActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.pillText, selectedCategory === 'all' && styles.pillTextActive]}>
              All Trades (सभी)
            </Text>
          </TouchableOpacity>

          {WORKER_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.pill, selectedCategory === cat.id && styles.pillActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[styles.pillText, selectedCategory === cat.id && styles.pillTextActive]}>
                {language === 'hi' ? cat.nameHi : cat.nameEn}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Jobs List */}
      <ScrollView
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.resultCount}>
          {jobs.length} Jobs Available ({selectedCategory.toUpperCase()})
        </Text>

        {jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
            <Text style={styles.emptyTitle}>No matching jobs found</Text>
            <Text style={styles.emptySub}>Try selecting a different category or clearing filters.</Text>
          </View>
        ) : (
          jobs.map(job => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              activeOpacity={0.88}
              onPress={() => router.push(`/job/${job.id}`)}
            >
              <View style={styles.cardTop}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{job.category.toUpperCase()}</Text>
                </View>
                <View style={styles.wageChip}>
                  <Text style={styles.wageText}>₹{job.dailyWage} / {t.perDay}</Text>
                </View>
              </View>

              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobDesc} numberOfLines={2}>
                {job.description}
              </Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaItem}>📍 {job.location}</Text>
                <Text style={styles.metaItem}>👥 {job.requiredWorkersCount} Workers Required</Text>
                <Text style={styles.metaItem}>⏱️ {job.durationDays} Days</Text>
              </View>

              <View style={styles.cardActionRow}>
                <View>
                  <Text style={styles.employerName}>Posted by {job.employerName}</Text>
                  <Text style={styles.postedTime}>Start: {job.startDate}</Text>
                </View>

                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => router.push(`/job/${job.id}`)}
                >
                  <Text style={styles.applyBtnText}>{t.applyNow} →</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#0F172A',
    paddingTop: 45,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  pillTextActive: {
    color: '#F97316',
  },
  listContainer: {
    padding: 16,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 12,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '800',
  },
  wageChip: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  wageText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '800',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  jobDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 10,
  },
  metaItem: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  employerName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  postedTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  applyBtn: {
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
});
