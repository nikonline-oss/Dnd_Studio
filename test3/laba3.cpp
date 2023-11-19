#include <iostream>
#include<vector>
using namespace std;

int main() {
	size_t n,c=0;
	cin>>n;
	vector<size_t> mas(n);
	for (size_t i = 0; i < n; i++) {
		cin >> mas[i];
	}
	
	size_t i = 1;
	while (i <= n) {
		for (size_t j = 0; j < n; j++) {
			if (mas[j] == i) {
				cout << j+1 << "\t";
				i++;
			}
		}
	}
	//function for finding the factorial
}