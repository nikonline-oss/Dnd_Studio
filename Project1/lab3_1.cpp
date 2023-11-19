#include <iostream>//подключаем библ-ку ввода и вывода
#include <locale>
using namespace std;

int main()
{
    setlocale(0, "rus");
    int x, y;
    cout << "введите координаты (х;у):";
    cin >> x >> y;
    if (((x >= 1 && x <= 3) && (y <= 1 && y >= -3)) == true) {
        cout << "Точка А входит в область: true";
    }
    else {
        cout << "Точка А не входит в область: false";
    }
}
