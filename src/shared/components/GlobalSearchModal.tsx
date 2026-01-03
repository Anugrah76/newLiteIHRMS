import React, { useState, useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Keyboard,
    Platform
} from 'react-native';
import { Search, X, ChevronRight, History } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@shared/theme';
import { NAVIGATION_REGISTRY, NavigationItem } from '../constants/navigationRegistry';

interface GlobalSearchModalProps {
    visible: boolean;
    onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ visible, onClose }) => {
    const theme = useTheme();
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<NavigationItem[]>([]);
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (visible) {
            // Slight delay to allow modal animation to start before focusing
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setResults([]);
        } else {
            Keyboard.dismiss();
        }
    }, [visible]);

    const handleSearch = (text: string) => {
        setQuery(text);
        if (text.trim().length === 0) {
            setResults([]);
            return;
        }

        const normalizedQuery = text.toLowerCase().trim();
        const filtered = NAVIGATION_REGISTRY.filter(item => {
            return (
                item.title.toLowerCase().includes(normalizedQuery) ||
                item.subtitle.toLowerCase().includes(normalizedQuery) ||
                item.category.toLowerCase().includes(normalizedQuery) ||
                item.keywords.some(k => k.toLowerCase().includes(normalizedQuery))
            );
        });

        setResults(filtered);
    };

    const handleSelect = (item: NavigationItem) => {
        onClose();
        // Small delay to allow modal to close smoothly before navigating
        setTimeout(() => {
            router.push(item.route as any);
        }, 300);
    };

    const renderItem = ({ item }: { item: NavigationItem }) => {
        const Icon = item.icon;
        return (
            <TouchableOpacity
                style={[styles.resultItem, { borderBottomColor: theme.colors.border }]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Icon size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
                        {item.title}
                    </Text>
                    <Text style={[styles.itemSubtitle, { color: theme.colors.textSecondary }]}>
                        {item.category} • {item.subtitle}
                    </Text>
                </View>
                <ChevronRight size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
        );
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={[styles.container, { backgroundColor: theme.isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)' }]}>
                {/* Search Header */}
                <View style={[styles.header, { borderBottomColor: theme.colors.border, marginTop: Platform.OS === 'ios' ? 40 : 20 }]}>
                    <View style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Search size={20} color={theme.colors.textSecondary} />
                        <TextInput
                            ref={inputRef}
                            style={[styles.input, { color: theme.colors.text }]}
                            placeholder="Search for actions, screens..."
                            placeholderTextColor={theme.colors.textTertiary}
                            value={query}
                            onChangeText={handleSearch}
                            returnKeyType="search"
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => handleSearch('')}>
                                <X size={16} color={theme.colors.textTertiary} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                        <Text style={[styles.cancelText, { color: theme.colors.primary }]}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                {/* Results List */}
                <FlatList
                    data={results}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                        query.length > 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                    No results found for "{query}"
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Search size={48} color={theme.colors.surfaceVariant} />
                                <Text style={[styles.emptyText, { color: theme.colors.textTertiary, marginTop: 16 }]}>
                                    Type to search availability across the app
                                </Text>
                            </View>
                        )
                    }
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
        borderBottomWidth: 1,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        borderRadius: 12,
        paddingHorizontal: 12,
        gap: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    cancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
    listContent: {
        paddingVertical: 8,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        gap: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    itemSubtitle: {
        fontSize: 13,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 15,
        textAlign: 'center',
    },
});
